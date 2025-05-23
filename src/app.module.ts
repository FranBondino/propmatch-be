import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as dotenv from 'dotenv'
import { dbConfig } from './config/database'
import { RequestLoggerMiddleware } from './middlewares/request-logger.middleware'
import { SecurityModule } from './modules/security/security.module'
import { SeederModule } from './modules/seeder/seeder.module'
import { AgencyProcedureModule } from './modules/agency-procedure/agency-procedure.module'
import { ApartmentModule } from './modules/apartment/apartment.module'
import { ApartmentRentModule } from './modules/apartment-rent/apartment-rent.module'
import { CarModule } from './modules/car/car.module'
import { CarRentModule } from './modules/car-rent/car-rent.module'
import { ApartmentRentMetricModule } from './modules/apartment-rent-metric/apartment-rent-metrics.module'
import { CarRentMetricModule } from './modules/car-rent-metric/car-rent-metric.module'
import { ExpenseModule } from './modules/expense/expense.module'
import { ClientModule } from './modules/client/client.module'
import { User } from './models/user.entity'
import { JobsModule } from './modules/jobs/jobs.module'
import { ApartmentAuditModule } from './modules/apartment-audit/apartment-audit.module'
import { AppointmentModule } from './modules/appointment/appointment.module'
import { EmailNotificationModule } from './modules/email-notification/email-notification.module'
import { ApartmentRentMetricOwnerModule } from './modules/apartment-rent-metric-owner/apartment-rent-metric-owner.module'
import { SessionAuditModule } from './modules/session-audit/session-audit.module'
import { DataLoaderModule } from './modules/data-loader/data-loader.module'
import { MetricsModule } from './modules/transform-metrics/metrics.module'


dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    TypeOrmModule.forFeature([
      User
    ]),
    SecurityModule,
    SeederModule,
    AgencyProcedureModule,
    ApartmentModule,
    ApartmentRentModule,
    CarModule,
    CarRentModule,
    ApartmentRentMetricModule,
    CarRentMetricModule,
    ExpenseModule,
    ClientModule,
    JobsModule,
    ApartmentAuditModule,
    ApartmentRentMetricOwnerModule,
    AppointmentModule,
    EmailNotificationModule,
    SessionAuditModule,
    DataLoaderModule,
    MetricsModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*')
  }
}
