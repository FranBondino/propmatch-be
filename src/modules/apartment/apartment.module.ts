import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApartmentService } from './apartment.service'
import { ApartmentController } from './apartment.controller'
import { SecurityModule } from '../security/security.module'
import { Apartment } from '../../models/renting/apartment.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { User } from '../../models/user.entity'
import { Appointment } from '../../models/appointment.entity'
import { ApartmentAuditModule } from '../apartment-audit/apartment-audit.module'
import { ApartmentAuditService } from '../apartment-audit/apartment-audit.service'
import { ApartmentAudit } from '../../models/renting/apartment-audit.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Apartment,
      ApartmentRent,
      User,
      Appointment,
      ApartmentAudit
    ]),
    SecurityModule,
    ApartmentAuditModule,
  ],
  providers: [
    ApartmentService,
    ApartmentAuditService
  ],
  controllers: [
    ApartmentController,
  ],
  exports: [
    ApartmentService,
  ]
})
export class ApartmentModule { }
