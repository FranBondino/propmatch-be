import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ExpenseJobService } from './expense-job.service'
import { ApartmentModule } from '../apartment/apartment.module'
import { ExpenseModule } from '../expense/expense.module'
import { SecurityModule } from '../security/security.module'

@Module({
  imports: [
    ApartmentModule,
    ExpenseModule,
    SecurityModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    ExpenseJobService,
  ]
})
export class JobsModule { }