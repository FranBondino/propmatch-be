import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../../models/appointment.entity';
import { User } from '../../models/user.entity';
import { Car } from '../../models/renting/car.entity';
import { Apartment } from '../../models/renting/apartment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { EmailNotificationModule } from '../email-notification/email-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      User,
      Car,
      Apartment,
    ]),
    EmailNotificationModule,
  ],
  providers: [
    AppointmentService,
    EmailNotificationService,
  ],
  controllers: [
    AppointmentController,
  ],
  exports: [
    AppointmentService,
  ],
})
export class AppointmentModule {}
