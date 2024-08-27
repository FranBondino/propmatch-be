import { FindOptionsWhere, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { RentPaginateQueryRaw, Paginated } from '../../types/types'
import { CreateCarRentDto, UpdateCarRentDto } from './car-rent.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { CarRent } from '../../models/renting/car-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { Car } from '../../models/renting/car.entity'
import { InjectRepository } from '@nestjs/typeorm'

const {
  CAR_RENT_NOT_FOUND,
  CAR_NOT_FOUND,
  CLIENT_NOT_FOUND
} = errorsCatalogs

@Injectable()
export class CarRentService {
  constructor(
    @InjectRepository(CarRent)
    private readonly repository: Repository<CarRent>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

  ) { }

  public async create(dto: CreateCarRentDto): Promise<CarRent> {
    const car = await this.carRepository.findOne({
      where: { id: dto.carId },
    })
    if (!car) throw new NotFoundException(CAR_NOT_FOUND)
  
    let client: Client | undefined
    if (dto.clientId) {
      client = await this.clientRepository.findOne({
        where: { id: dto.clientId },
      })
      if (!client) throw new NotFoundException(CLIENT_NOT_FOUND)
    }
  
    const obj = this.repository.create({
      ...dto,
      car,
      client
    })
    return this.repository.save(obj)
  }


  public async getAll(query: RentPaginateQueryRaw): Promise<Paginated<CarRent>> {
    const qb = this.repository.createQueryBuilder('carRent')
      .leftJoinAndSelect('carRent.car', 'car')
      .leftJoinAndSelect('carRent.client', 'client')

    if (query.startedAt || query.endedAt) {
      qb.andWhere('(carRent.startedAt >= :startedAt OR carRent.endedAt <= :endedAt)', {
        startedAt: query.startedAt,
        endedAt: query.endedAt,
      })
    }

    if (query.search) {
      qb.andWhere(`LOWER(car.model) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(car.make) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<CarRent>(qb, query)
  }

  public async findByCarId(
    carId: string,
    query: RentPaginateQueryRaw,
  ): Promise<Paginated<CarRent>> {
    const qb = this.repository
      .createQueryBuilder('carRent')
      .leftJoinAndSelect('carRent.car', 'car')
      .where('car.id = :id', { id: carId })
  
    if (query.startedAt) {
      qb.andWhere('carRent.startedAt >= :startedAt', { startedAt: new Date(query.startedAt) })
    }
    if (query.endedAt) {
      qb.andWhere('carRent.endedAt <= :endedAt', { endedAt: new Date(query.endedAt) })
    }

    return GetAllPaginatedQB<CarRent>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<CarRent>): Promise<CarRent> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(CAR_RENT_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateCarRentDto): Promise<void> {
    let client: Client
    const obj = await this.getById(dto.id, null)

    if (dto?.clientId) {
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
    if (result.affected === 0) throw new NotFoundException(CAR_RENT_NOT_FOUND)
  }
}

