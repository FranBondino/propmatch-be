import { FindOptionsWhere, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { RentPaginateQueryRaw, Paginated } from '../../types/types'
import { CreateApartmentRentDto, UpdateApartmentRentDto } from './apartment-rent.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { InjectRepository } from '@nestjs/typeorm'

const {
  APARTMENT_RENT_NOT_FOUND,
  APARTMENT_NOT_FOUND,
  CLIENT_NOT_FOUND
} = errorsCatalogs

@Injectable()
export class ApartmentRentService {
  constructor(
    @InjectRepository(ApartmentRent)
    private readonly repository: Repository<ApartmentRent>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>
  ) { }

  public async create(dto: CreateApartmentRentDto): Promise<ApartmentRent> {
    const apartment = await this.apartmentRepository.findOne({
      where: { id: dto.apartmentId },
    })
    if (!apartment) throw new NotFoundException(APARTMENT_NOT_FOUND)
  
    let client: Client | undefined
    if (dto.clientId) {
      client = await this.clientRepository.findOne({
        where: { id: dto.clientId },
      })
      if (!client) throw new NotFoundException(CLIENT_NOT_FOUND)
    }
  
    const obj = this.repository.create({
      ...dto,
      apartment,
      client
    })
    return this.repository.save(obj)
  }

  public async getAll(query: RentPaginateQueryRaw): Promise<Paginated<ApartmentRent>> {
    const qb = this.repository.createQueryBuilder('apartmentRent')
      .leftJoinAndSelect('apartmentRent.apartment', 'apartment')
      .leftJoinAndSelect('apartmentRent.client', 'client')

    if (query.startedAt) {
      qb.andWhere('apartmentRent.startedAt >= :startedAt', { startedAt: query.startedAt })
    }
    if (query.endedAt) {
      qb.andWhere('apartmentRent.endedAt <= :endedAt', { endedAt: query.endedAt })
    }
    if (query.city) {
      qb.andWhere('apartment.city = :city', { city: query.city })
    }
    if (query.startedAt) {
      qb.andWhere('apartmentRent.startedAt >= :startedAt', { startedAt: new Date(query.startedAt) })
    }

    return GetAllPaginatedQB<ApartmentRent>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<ApartmentRent>): Promise<ApartmentRent> {
    const obj = await this.repository.findOne(({
      where: { id },
      relations: ['apartment', 'client'],
      ...options,
    }))
    if (!obj) throw new NotFoundException(APARTMENT_RENT_NOT_FOUND)
    return obj
  }

  public async findByApartmentId(
    apartmentId: string,
    query: RentPaginateQueryRaw,
  ): Promise<Paginated<ApartmentRent>> {
    const qb = this.repository
      .createQueryBuilder('apartmentRent')
      .leftJoinAndSelect('apartmentRent.apartment', 'apartment')
      .where('apartment.id = :id', { id: apartmentId })
  
    if (query.startedAt) {
      qb.andWhere('apartmentRent.startedAt >= :startedAt', { startedAt: new Date(query.startedAt) })
    }
    if (query.endedAt) {
      qb.andWhere('apartmentRent.endedAt <= :endedAt', { endedAt: new Date(query.endedAt) })
    }

    return GetAllPaginatedQB<ApartmentRent>(qb, query)
  }

  public async update(dto: UpdateApartmentRentDto): Promise<void> {
    let client: Client
    const obj = await this.getById(dto.id, null)

    if (dto.clientId) {
      client = await this.clientRepository.findOne({
        where: { id: dto.clientId },
      })

      if (!client) throw new NotFoundException(CLIENT_NOT_FOUND)
    }

    await this.repository.save({
      ...obj,
      ...dto,
      client
    })
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(APARTMENT_RENT_NOT_FOUND)
  }
}
