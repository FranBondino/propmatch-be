import { Injectable, NotFoundException } from '@nestjs/common'
import { Log } from '../../../models/log.entity'
import { errorsCatalogs } from '../../../catalogs/errors-catalogs'
import { Paginated, PaginateQueryRaw } from '../../../types/types'
import { CreateLogDto } from './log.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { GetAllPaginatedQB } from '../../../helpers/pagination.helper'

const { LOG_NOT_FOUND } = errorsCatalogs

const { SHOULD_STORE_LOGS } = process.env
@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly repository: Repository<Log>
  ) { }

  public async getById(id: string, options: any): Promise<Log> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(LOG_NOT_FOUND)
    return obj
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Log>> {
    const qb = this.repository.createQueryBuilder('log')
    return GetAllPaginatedQB(qb, query)
  }

  public async create(dto: CreateLogDto): Promise<Log> {
    if (SHOULD_STORE_LOGS === 'false') return
    return this.repository.create(dto).save()
  }
}
