import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityModule } from '../security/security.module'
import { ApartmentModule } from '../apartment/apartment.module'
import { ClientModule } from '../client/client.module'
import { ApartmentRentModule } from '../apartment-rent/apartment-rent.module'
import { ExpenseModule } from '../expense/expense.module'
import { Expense } from '../../models/renting/expense.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { ApartmentRentMetricOwnerController } from './apartment-rent-metric-owner-controller'
import { ApartmentRentMetricOwnerService } from './apartment-rent-metric-owner.service'

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
    ApartmentRentMetricOwnerService,
  ],
  controllers: [
    ApartmentRentMetricOwnerController,
  ],
  exports: [
    ApartmentRentMetricOwnerService,
  ]
})
export class ApartmentRentMetricOwnerModule { }