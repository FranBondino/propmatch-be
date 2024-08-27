import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './appointment.dto';
import { AppointmentService } from './appointment.service';
import { Appointment } from '../../models/appointment.entity';
import { Paginated, PaginateQueryRaw } from '../../types/types';
import { getOptionsFromJSON } from '../../helpers/validation.helper';
import { IdRequired } from '../../helpers/helper.dto';
import { JwtAuthGuard } from '../security/auth/auth.guard';
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard';
import { ResponseInterceptor } from '../../helpers/response.interceptor';
import { Request } from 'express';
import { User } from '../../models/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class AppointmentController {
  constructor( 
    private readonly service: AppointmentService,
  ) { }

  @Post()
  public async createAppointment(@Body() dto: CreateAppointmentDto, @Req() req: Request): Promise<Appointment> {
    const user = req.user as User
    return this.service.createAppointment(dto, user.id);
  }

  @Put('/status')
  public async updateAppointmentStatus(@Body() dto: UpdateAppointmentStatusDto): Promise<Appointment> {
    return this.service.updateAppointmentStatus(dto);
  }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    // Implement pagination or filtering logic if needed
    return this.service.getAllAppointments(query);
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<Appointment> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getAppointmentById(id, options)
  }
}
