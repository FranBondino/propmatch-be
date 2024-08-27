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
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Paginated, UserType, RentPaginateQueryRaw } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateApartmentRentDto, UpdateApartmentRentDto } from './apartment-rent.dto'
import { ApartmentRentService } from './apartment-rent.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('apartment-rents')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/apartment-rent')
export class ApartmentRentController {
  constructor(
    private readonly service: ApartmentRentService,
  ) { }

  /*
  @Get()
  public async getAll(@Query() query: RentPaginateQueryRaw): Promise<Paginated<ApartmentRent>> {
    return this.service.getAll(query)
  }

  */
  @Post()
  public async create(@Body() dto: CreateApartmentRentDto): Promise<ApartmentRent> {
    return this.service.create(dto)
  }

  @Get()
public async getAll(
  @Query('apartmentId') apartmentId: string,
  @Query() query: RentPaginateQueryRaw
): Promise<Paginated<ApartmentRent> | ApartmentRent[]> {
  if (apartmentId) {
    // Fetch apartment rents filtered by apartmentId
    return this.service.findByApartmentId(apartmentId, query)
  } else {
    // Fetch all apartment rents
    return this.service.getAll(query)
  }
}

  @Get('apartment/:id')
  public async findByApartmentId(
  @Param('id') apartmentId: string,
  @Query() query: RentPaginateQueryRaw,
  ): Promise<Paginated<ApartmentRent>> {
    return this.service.findByApartmentId(apartmentId, query)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<ApartmentRent> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Put()
  public async update(@Body() dto: UpdateApartmentRentDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
