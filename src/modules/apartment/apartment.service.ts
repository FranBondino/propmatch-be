import { FindOptionsWhere, Repository } from 'typeorm'
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateApartmentDto, UpdateApartmentDto } from './apartment.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { format } from 'date-fns'
import { InjectRepository } from '@nestjs/typeorm'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { User } from '../../models/user.entity'
import { Appointment } from '../../models/appointment.entity'
import { ApartmentAuditService } from '../apartment-audit/apartment-audit.service'

const { APARTMENT_NOT_FOUND, APARTMENT_HAS_RENTS } = errorsCatalogs

@Injectable()
export class ApartmentService {
  constructor(
    @InjectRepository(Apartment)
    private readonly repository: Repository<Apartment>,
    @InjectRepository(ApartmentRent)
    private readonly apartmentRentRepository: Repository<ApartmentRent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly apartmentAuditService: ApartmentAuditService,
  ) { }

  public async create(dto: CreateApartmentDto, userId: string): Promise<Apartment> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException("user was not found")
    const apartment = this.repository.create({
      ...dto,
      owner: user,
    })
    const savedApartment = await this.repository.save(apartment)

    await this.apartmentAuditService.logAction(
      savedApartment.id,
      'Create',
      { old: null, new: dto },
      userId,
    )

    return savedApartment
  }

  public async getAllOwnerApartments(userId: string, query: PaginateQueryRaw): Promise<Paginated<Apartment>> {
    const qb = this.repository.createQueryBuilder('apartment')
      .leftJoinAndSelect('apartment.owner', 'owner')
      .where('owner.id = :userId', { userId })

    if (query.search) {
      qb.andWhere(`LOWER(apartment.city) ILIKE :search`, { search: `%${query.search.toLowerCase()}%` })
        .orWhere(`LOWER(apartment.fullAddress) ILIKE :search`, { search: `%${query.search.toLowerCase()}%` });
    }

    return GetAllPaginatedQB<Apartment>(qb, query)
  }

  public async findByOwnerId(ownerId: string): Promise<Apartment[]> {
    return this.repository.find({
      where: { owner: { id: ownerId } },
    });
  }

  public async findAll(): Promise<Apartment[]> {
    return this.repository.find()
  }

  public async getOwnerByApartmentId(apartmentId: string): Promise<User> {
    const apartment = await this.repository.findOne({
      where: { id: apartmentId },
      relations: ['owner'],
    });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    if (!apartment.owner) {
      throw new NotFoundException('Owner not found for this apartment');
    }

    return apartment.owner;
  }


  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Apartment>> {
    const qb = this.repository.createQueryBuilder('apartment')

    if (query.search) {
      qb.andWhere(`LOWER(apartment.city) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(apartment.fullAddress) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<Apartment>(qb, query)
  }

  public async getAvailableApartments(query: PaginateQueryRaw): Promise<Paginated<Apartment>> {
    const currentDate = format(new Date(), 'yyyy-MM-dd'); // Format the current date (YYYY-MM-DD)

    const qb = this.repository.createQueryBuilder('apartment')
      .leftJoin(ApartmentRent, 'apartmentRent', 'apartment.id = apartmentRent.apartment.id')
      .where(`
        apartmentRent.id IS NULL OR 
        apartmentRent.startedAt > :currentDate OR 
        apartmentRent.endedAt < :currentDate
      `, { currentDate }) // Exclude apartments with ongoing rents

    if (query.search) {
      qb.andWhere(`LOWER(apartment.city) ILIKE :search`, { search: `%${query.search.toLowerCase()}%` })
        .orWhere(`LOWER(apartment.fullAddress) ILIKE :search`, { search: `%${query.search.toLowerCase()}%` });
    }

    // Use the same pagination helper for returning paginated results
    return GetAllPaginatedQB<Apartment>(qb, query);
  }


  public async getById(id: string, options: FindOptionsWhere<Apartment>): Promise<Apartment> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(APARTMENT_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateApartmentDto, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException("user was not found")

    const apartment = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['owner']
    })
    if (!apartment) throw new NotFoundException('Apartment not found')
    if (apartment.owner.id !== userId) throw new ForbiddenException('You are not allowed to update this apartment')

    const oldData = { ...apartment }
    // Merge the updates and save the apartment
    Object.assign(apartment, dto)

    await this.repository.save(apartment)

    await this.apartmentAuditService.logAction(
      apartment.id,
      'Update',
      { old: oldData, new: dto },
      userId
    )
  }


  public async deleteById(id: string, userId: string): Promise<void> {
    const apartment = await this.repository.findOne({
      where: { id },
    })

    if (!apartment) {
      throw new NotFoundException(APARTMENT_NOT_FOUND)
    }

    const hasRents = await this.apartmentRentRepository.findOne({
      where: { apartment: { id: apartment.id } },
    })

    if (hasRents) {
      throw new ConflictException(APARTMENT_HAS_RENTS)
    }

    const hasAppointments = await this.appointmentRepository.findOne({
      where: { apartment: { id: apartment.id } },
    })

    if (hasAppointments) throw new ConflictException("apartment has appointments")

    const result = await this.repository.softDelete(id)

    if (result.affected === 0) {
      throw new NotFoundException(APARTMENT_NOT_FOUND)
    }

    await this.apartmentAuditService.logAction(
      id,
      'Delete',
      { old: apartment, new: null },
      userId
    )
  }

}


