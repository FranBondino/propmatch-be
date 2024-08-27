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
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw, UserType } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateApartmentDto, UpdateApartmentDto } from './apartment.dto'
import { ApartmentService } from './apartment.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('apartments')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/apartment')
export class ApartmentController {
  constructor(
    private readonly service: ApartmentService,
  ) { }

  @Post()
  public async create(@Body() dto: CreateApartmentDto): Promise<Apartment> {
    return this.service.create(dto)
  }

  @Get()
public async getAll(
  @Query('id') id: string,
  @Query() query: PaginateQueryRaw
): Promise<Paginated<Apartment> | Apartment> {
  if (id) {
    return this.service.getById(id, null); // Fetch a single apartment by ID
  } else {
    return this.service.getAll(query); // Fetch all apartments
  }
}

  @Put()
  public async update(@Body() dto: UpdateApartmentDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
