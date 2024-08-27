import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CarRentService } from './car-rent.service'
import { CarRentController } from './car-rent.controller'
import { SecurityModule } from '../security/security.module'
import { ClientModule } from '../client/client.module'
import { CarModule } from '../car/car.module'
import { CarRent } from '../../models/renting/car-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { Car } from '../../models/renting/car.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarRent,
      Client,
      Car
    ]),
    SecurityModule,
    ClientModule,
    CarModule
  ],
  providers: [
    CarRentService,
  ],
  controllers: [
    CarRentController,
  ],
  exports: [
    CarRentService,
  ]
})
export class CarRentModule { }