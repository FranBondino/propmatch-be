import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CarRentMetricService } from './car-rent-metric.service'
import { SecurityModule } from '../security/security.module'
import { CarModule } from '../car/car.module'
import { ClientModule } from '../client/client.module'
import { CarRentModule } from '../car-rent/car-rent.module'
import { CarRentMetricController } from './car-rent-metric.controller'
import { Car } from '../../models/renting/car.entity'
import { CarRent } from '../../models/renting/car-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { Expense } from '../../models/renting/expense.entity'
import { ExpenseModule } from '../expense/expense.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Car,
      CarRent,
      Client
    ]),
    SecurityModule,
    CarModule,
    ExpenseModule,
    ClientModule,
    CarRentModule
  ],
  providers: [
    CarRentMetricService,
  ],
  controllers: [
    CarRentMetricController,
  ],
  exports: [
    CarRentMetricService,
  ]
})
export class CarRentMetricModule { }