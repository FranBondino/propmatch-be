import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors
} from '@nestjs/common'
import { ResponseInterceptor } from '../../../helpers/response.interceptor'
import { Paginated, PaginateQueryRaw, UserType } from '../../../types/types'
import { LogService } from './log.service'
import { Log } from 'src/models/log.entity'


@Controller('logs')
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class LogController {
  constructor(private readonly service: LogService) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Log>> {
    return this.service.getAll(query)
  }
}


