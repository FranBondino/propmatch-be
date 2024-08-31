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
  Req,
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
import { Request } from 'express'
import { User } from '../../models/user.entity'

const { admin, owner, user } = UserType

@Controller('apartments')
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/apartment')
export class ApartmentController {
  constructor(
    private readonly service: ApartmentService,
  ) { }

  @Post()
  @AllowedUsers(admin, owner)
  public async create(@Body() dto: CreateApartmentDto, @Req() req: Request): Promise<Apartment> {
    const user = req.user as User
    return this.service.create(dto, user.id)
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

@Get('owner')
@AllowedUsers(admin, owner)
public async getAllOwnerApartments(
  @Req() req: Request,
  @Query() query: PaginateQueryRaw
): Promise<Paginated<Apartment>> {
  const user = req.user as User
  return this.service.getAllOwnerApartments(user.id, query);
}

  @Put()
  @AllowedUsers(admin, owner)
  public async update(@Body() dto: UpdateApartmentDto, @Req() req: Request): Promise<void> {
    const user = req.user as User
    return this.service.update(dto, user.id)
  }

  @Delete('/:id')
  @AllowedUsers(admin, owner)
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
