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
  All,
  NotFoundException,
} from '@nestjs/common'
import { IdRequired } from '../../helpers/helper.dto'
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw, UserType } from '../../types/types'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateApartmentDto, UpdateApartmentDto } from './apartment.dto'
import { ApartmentService } from './apartment.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { Request } from 'express'
import { User } from '../../models/user.entity'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { getOptionsFromJSON } from '../../helpers/validation.helper'

const { admin, owner, user } = UserType

@Controller('apartments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class ApartmentController {
  constructor(
    private readonly service: ApartmentService,
  ) { }

  @Post()
  public async create(@Body() dto: CreateApartmentDto, @Req() req: Request): Promise<Apartment> {
    const user = req.user as User
    return this.service.create(dto, user.id)
  }

  //MODOFY METHOD

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<Apartment> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Apartment>> {
      return this.service.getAll(query); // Fetch all apartments
    }
  
  /*
  @Get(':id/owner')
    public async getOwnerByApartment(@Param('id') apartmentId: string): Promise<User> {
      const owner = await this.service.getOwnerByApartment(apartmentId);
  
      if (!owner) {
        throw new NotFoundException(`Owner for apartment with ID ${apartmentId} not found`);
      }
  
      return owner;
    }
  */
  @Get('owner')
  public async getAllOwnerApartments(
    @Req() req: Request,
    @Query() query: PaginateQueryRaw
  ): Promise<Paginated<Apartment>> {
    console.log('User from request:', req.user); // Ensure req.user is correctly populated
    const user = req.user as User
    return this.service.getAllOwnerApartments(user.id, query);
  }

  @Get(':id/owner')
  async getOwnerByApartmentId(@Param('id') apartmentId: string): Promise<User> {
    try {
      return await this.service.getOwnerByApartmentId(apartmentId);
    } catch (error) {
      throw new NotFoundException('Owner not found for this apartment');
    }
  }


  @Get('available')
  public async getAvailableApartments(
    @Query() query: PaginateQueryRaw
  ): Promise<Paginated<Apartment>> {
    return this.service.getAvailableApartments(query); // Fetch available apartments
  }

  @Put()
  public async update(@Body() dto: UpdateApartmentDto, @Req() req: Request): Promise<void> {
    const user = req.user as User
    return this.service.update(dto, user.id)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
