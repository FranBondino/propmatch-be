import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CarService } from './car.service'
import { CarController } from './car.controller'
import { SecurityModule } from '../security/security.module'
import { Car } from '../../models/renting/car.entity'
import { CarRent } from '../../models/renting/car-rent.entity'
import { User } from '../../models/user.entity'
import { Appointment } from '../../models/appointment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car,
      CarRent,
      User,
      Appointment
    ]),
    SecurityModule,
  ],
  providers: [
    CarService,
  ],
  controllers: [
    CarController,
  ],
  exports: [
    CarService,
  ]
})
export class CarModule { }
