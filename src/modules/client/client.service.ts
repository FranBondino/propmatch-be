import { FindOptionsWhere, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Client } from '../../models/renting/client.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateClientDto, UpdateClientDto } from './client.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { InjectRepository } from '@nestjs/typeorm'

const { CLIENT_NOT_FOUND } = errorsCatalogs

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly repository: Repository<Client>
  ) { }

  public async create(dto: CreateClientDto): Promise<Client> {
    const client = this.repository.create(dto)

    return this.repository.save(client)
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Client>> {
    const qb = this.repository.createQueryBuilder('client')

    if (query.search) {
      qb.andWhere(`LOWER(client.fullName) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(client.fullAddress) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<Client>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<Client>): Promise<Client> {
    const obj = await this.repository.findOne({ where: { id }, ...options })
    if (!obj) throw new NotFoundException(CLIENT_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateClientDto): Promise<void> {
    const obj = await this.getById(dto.id, null)

    await this.repository.save({
      ...obj,
      ...dto,
    })
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(CLIENT_NOT_FOUND)
  }
}
