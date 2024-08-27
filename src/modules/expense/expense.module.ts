import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { SecurityModule } from '../security/security.module'
import { ApartmentModule } from '../apartment/apartment.module'
import { Expense } from '../../models/renting/expense.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { Car } from '../../models/renting/car.entity'
import { CarModule } from '../car/car.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Apartment,
      Car
    ]),
    SecurityModule,
    ApartmentModule,
    CarModule
  ],
  providers: [
    ExpenseService,
  ],
  controllers: [
    ExpenseController,
  ],
  exports: [
    ExpenseService,
  ]
})
export class ExpenseModule { }