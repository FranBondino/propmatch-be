import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { SecurityModule } from '../security/security.module'
import { ApartmentModule } from '../apartment/apartment.module'
import { Expense } from '../../models/renting/expense.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { User } from '../../models/user.entity'
import { ExpenseJobService } from '../jobs/expense-job.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Apartment,
      User,
    ]),
    SecurityModule,
    ApartmentModule,
  ],
  providers: [
    ExpenseService,
    ExpenseJobService
  ],
  controllers: [
    ExpenseController,
  ],
  exports: [
    ExpenseService,
  ]
})
export class ExpenseModule { }