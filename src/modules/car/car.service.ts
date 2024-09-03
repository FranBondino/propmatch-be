import { FindOptionsWhere, Repository } from 'typeorm'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Car } from '../../models/renting/car.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateCarDto, UpdateCarDto } from './car.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { InjectRepository } from '@nestjs/typeorm'
import { CarRent } from '../../models/renting/car-rent.entity'
import { CarAuditService } from '../car-audit/car-audit.service'
import { User } from '../../models/user.entity'
import { Appointment } from '../../models/appointment.entity'

const { CAR_NOT_FOUND, CAR_HAS_RENTS } = errorsCatalogs

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly repository: Repository<Car>,
    @InjectRepository(CarRent)
    private readonly carRentRepository: Repository<CarRent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly carAuditService: CarAuditService,
  ) { }

  public async create(dto: CreateCarDto, userId: string): Promise<Car> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException("user was not found")
    const car = this.repository.create({
      ...dto,
    owner: user,
    })
    const savedCar = await this.repository.save(car)

    await this.carAuditService.logAction(
      savedCar.id,
      'Create',
      { old: null, new: dto }, 
      userId,
    )

    return savedCar
  }

  public async findAll(): Promise<Car[]> {
    return this.repository.find()
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Car>> {
    const qb = this.repository.createQueryBuilder('car')

    if (query.search) {
      qb.andWhere(`LOWER(car.model) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(car.make) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(car.licensePlate) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<Car>(qb, query)
  }

  public async getAllOwnerCars(userId: string, query: PaginateQueryRaw): Promise<Paginated<Car>> {
    const qb = this.repository.createQueryBuilder('car')
      .leftJoinAndSelect('car.owner', 'owner')
      .where('owner.id = :userId', { userId })

      if (query.search) {
        qb.andWhere(`LOWER(car.model) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
        qb.orWhere(`LOWER(car.make) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
        qb.orWhere(`LOWER(car.licensePlate) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      }

    return GetAllPaginatedQB<Car>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<Car>): Promise<Car> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(CAR_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateCarDto, userId: string): Promise<void> {
    const obj = await this.getById(dto.id, null);

    const oldData = { ...obj };
    Object.assign(obj, dto);

    await this.repository.save(obj);

    await this.carAuditService.logAction(
      obj.id,
      'Update',
      { old: oldData, new: dto },
      userId
    );
  }

  public async deleteById(id: string, userId: string): Promise<void> {
    const car= await this.repository.findOne({
      where: { id },
    })
  
    if (!car) {
      throw new NotFoundException(CAR_NOT_FOUND)
    }
  
    const hasRents = await this.carRentRepository.findOne({
      where: { car: { id: car.id } },
    })
  
    if (hasRents) {
      throw new ConflictException(CAR_HAS_RENTS)
    }

    const hasAppointments = await this.appointmentRepository.findOne({
      where: { car: { id: car.id } },
    })

    if (hasAppointments) throw new ConflictException("car has appointments")
  
    const result = await this.repository.softDelete(id)
  
    if (result.affected === 0) {
      throw new NotFoundException(CAR_NOT_FOUND)
    }

    // Log the deletea ction
    await this.carAuditService.logAction(
      id,
      'Delete',
      { old: car, new: null },
      userId
    )
  }
}
