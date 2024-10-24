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
