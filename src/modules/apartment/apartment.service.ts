import { FindOptionsWhere, Repository } from 'typeorm'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateApartmentDto, UpdateApartmentDto } from './apartment.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { InjectRepository } from '@nestjs/typeorm'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'

const { APARTMENT_NOT_FOUND, APARTMENT_HAS_RENTS } = errorsCatalogs

@Injectable()
export class ApartmentService {
  constructor(
    @InjectRepository(Apartment)
    private readonly repository: Repository<Apartment>,
    @InjectRepository(ApartmentRent)
    private readonly apartmentRentRepository: Repository<ApartmentRent>,
  ) { }

  public async create(dto: CreateApartmentDto): Promise<Apartment> {
    const apartment = this.repository.create(dto)

    return this.repository.save(apartment)
  }

  public async findAll(): Promise<Apartment[]> {
    return this.repository.find()
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Apartment>> {
    const qb = this.repository.createQueryBuilder('apartment')

    if (query.search) {
      qb.andWhere(`LOWER(apartment.city) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(apartment.fullAddress) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<Apartment>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<Apartment>): Promise<Apartment> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(APARTMENT_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateApartmentDto): Promise<void> {
    const obj = await this.getById(dto.id, null)

    await this.repository.save({
      ...obj,
      ...dto,
    })
  }

  public async deleteById(id: string): Promise<void> {
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
  
    const result = await this.repository.softDelete(id)
  
    if (result.affected === 0) {
      throw new NotFoundException(APARTMENT_NOT_FOUND)
    }
  }
  
}


