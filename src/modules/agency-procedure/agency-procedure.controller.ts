import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { IdRequired } from '../../helpers/helper.dto'
import { getOptionsFromJSON } from '../../helpers/validation.helper'
import { AgencyProcedure } from '../../models/agency-procedure.entity'
import { Paginated, UserType, RentPaginateQueryRaw } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateAgencyProcedureDto, UpdateAgencyProcedureDto } from './agency-procedure.dto'
import { AgencyProcedureService } from './agency-procedure.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('agency-procedures')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/agency-procedures')
export class AgencyProcedureController {
  constructor(
    private readonly service: AgencyProcedureService,
  ) { }

  @Get()
  public async getAll(@Query() query: RentPaginateQueryRaw): Promise<Paginated<AgencyProcedure>> {
    return this.service.getAll(query)
  }

  @Post()
  public async create(@Body() dto: CreateAgencyProcedureDto): Promise<AgencyProcedure> {
    return this.service.create(dto)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<AgencyProcedure> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Put()
  public async update(@Body() dto: UpdateAgencyProcedureDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
