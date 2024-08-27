import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common'
import { IdRequired } from '../../helpers/helper.dto'
import { getOptionsFromJSON } from '../../helpers/validation.helper'
import { Client } from '../../models/renting/client.entity'
import { Paginated, PaginateQueryRaw, UserType } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateClientDto, UpdateClientDto } from './client.dto'
import { ClientService } from './client.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('clients')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/clients')
export class ClientController {
  constructor(
    private readonly service: ClientService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Client>> {
    return this.service.getAll(query)
  }

  @Post()
  public async create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.service.create(dto)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<Client> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Put()
  public async update(@Body() dto: UpdateClientDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
