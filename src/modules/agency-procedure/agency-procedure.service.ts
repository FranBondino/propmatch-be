import { FindOptionsWhere, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Client } from '../../models/renting/client.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateAgencyProcedureDto, UpdateAgencyProcedureDto } from './agency-procedure.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { AgencyProcedure } from '../../models/agency-procedure.entity'
import { InjectRepository } from '@nestjs/typeorm'

const {
  AGENCY_PROCEDURE_NOT_FOUND,
  CLIENT_NOT_FOUND,
} = errorsCatalogs

@Injectable()
export class AgencyProcedureService {
  constructor(
    @InjectRepository(AgencyProcedure)
    private readonly repository: Repository<AgencyProcedure>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>
  ) { }

  public async create(dto: CreateAgencyProcedureDto): Promise<AgencyProcedure> {
    if (dto.clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: dto.clientId },
      })
      if (!client) throw new NotFoundException(CLIENT_NOT_FOUND)
    }

    const obj = this.repository.create({
      ...dto,
    })
    return this.repository.save(obj)
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<AgencyProcedure>> {
    const qb = this.repository.createQueryBuilder('procedure')
      .leftJoinAndSelect('procedure.client', 'client')
      .where('1 = 1')

    if (query.search) {
      qb.andWhere(`LOWER(procedure.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<AgencyProcedure>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<AgencyProcedure>): Promise<AgencyProcedure> {
    const obj = await this.repository.findOne({ where: { id }, ...options })
    if (!obj) throw new NotFoundException(AGENCY_PROCEDURE_NOT_FOUND)
    return obj
  }

  public async update(dto: UpdateAgencyProcedureDto): Promise<void> {
    const obj = await this.getById(dto.id, null)

    if (dto.clientId) {
      const client = await this.clientRepository.findOne({
        where: { id: dto.clientId },
      })

      if (!client) throw new NotFoundException(CLIENT_NOT_FOUND)
    }

    await this.repository.save({
      ...obj,
      ...dto,
    })
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(AGENCY_PROCEDURE_NOT_FOUND)
  }
}
