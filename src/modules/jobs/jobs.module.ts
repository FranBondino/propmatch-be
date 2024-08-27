import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ExpenseJobService } from './expense-job.service'
import { ApartmentModule } from '../apartment/apartment.module'
import { ExpenseModule } from '../expense/expense.module'
import { CarModule } from '../car/car.module'

@Module({
  imports: [
    ApartmentModule,
    CarModule,
    ExpenseModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    ExpenseJobService,
  ]
})
export class JobsModule { }