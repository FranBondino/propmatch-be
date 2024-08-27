import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApartmentRentMetricService } from './apartment-rent-metric.service'
import { SecurityModule } from '../security/security.module'
import { ApartmentModule } from '../apartment/apartment.module'
import { ClientModule } from '../client/client.module'
import { ApartmentRentModule } from '../apartment-rent/apartment-rent.module'
import { ExpenseModule } from '../expense/expense.module'
import { ApartmentRentMetricController } from './apartment-rent-metric-controller'
import { Expense } from '../../models/renting/expense.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Client } from '../../models/renting/client.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Apartment,
      ApartmentRent,
      Client
    ]),
    SecurityModule,
    ApartmentModule,
    ExpenseModule,
    ClientModule,
    ApartmentRentModule
  ],
  providers: [
    ApartmentRentMetricService,
  ],
  controllers: [
    ApartmentRentMetricController,
  ],
  exports: [
    ApartmentRentMetricService,
  ]
})
export class ApartmentRentMetricModule { }