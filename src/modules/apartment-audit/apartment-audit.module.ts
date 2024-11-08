import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityModule } from '../security/security.module'
import { ApartmentAudit } from '../../models/renting/apartment-audit.entity'
import { User } from '../../models/user.entity'
import { ApartmentAuditService } from './apartment-audit.service'
import { ApartmentAuditController } from './apartment-audit.controller'
import { Apartment } from '../../models/renting/apartment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApartmentAudit,
      Apartment,
      User
    ]),
    SecurityModule,
  ],
  providers: [
    ApartmentAuditService,
  ],
  controllers: [
    ApartmentAuditController,
  ],
  exports: [
    ApartmentAuditService,
  ]
})
export class ApartmentAuditModule { }
