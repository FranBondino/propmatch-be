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
import { CarRent } from '../../models/renting/car-rent.entity'
import { Paginated, UserType, RentPaginateQueryRaw } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateCarRentDto, UpdateCarRentDto } from './car-rent.dto'
import { CarRentService } from './car-rent.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('car-rents')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/car-rent')
export class CarRentController {
  constructor(
    private readonly service: CarRentService,
  ) { }

  @Get()
  public async getAll(@Query() query: RentPaginateQueryRaw): Promise<Paginated<CarRent>> {
    return this.service.getAll(query)
  }

  @Post()
  public async create(@Body() dto: CreateCarRentDto): Promise<CarRent> {
    return this.service.create(dto)
  }

  @Get('car/:id')
  public async findByApartmentId(
  @Param('id') carId: string,
  @Query() query: RentPaginateQueryRaw,
  ): Promise<Paginated<CarRent>> {
    return this.service.findByCarId(carId, query)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<CarRent> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Put()
  public async update(@Body() dto: UpdateCarRentDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
