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
  ClassSerializerInterceptor,
  Req
} from '@nestjs/common'
import { Request } from 'express'
import { IdRequired } from '../../helpers/helper.dto'
import { getOptionsFromJSON } from '../../helpers/validation.helper'
import { Car } from '../../models/renting/car.entity'
import { Paginated, PaginateQueryRaw, UserType } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateCarDto, UpdateCarDto } from './car.dto'
import { CarService } from './car.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { User } from '../../models/user.entity'

const { admin, owner } = UserType

@Controller('cars')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/car')
export class CarController {
  constructor(
    private readonly service: CarService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Car>> {
    return this.service.getAll(query)
  }

  @Get('owner')
@AllowedUsers(admin, owner)
public async getAllOwnerCars(
  @Req() req: Request,
  @Query() query: PaginateQueryRaw
): Promise<Paginated<Car>> {
  const user = req.user as User
  return this.service.getAllOwnerCars(user.id, query);
}

  @Post()
  public async create(@Body() dto: CreateCarDto, @Req() req: Request): Promise<Car> {
    const user = req.user as User
    return this.service.create(dto, user.id)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<Car> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Put()
  public async update(@Body() dto: UpdateCarDto, @Req() req: Request): Promise<void> {
    const user = req.user as User
    return this.service.update(dto, user.id)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired, @Req() req: Request): Promise<void> {
    const user = req.user as User
    return this.service.deleteById(id, user.id)
  }
}
