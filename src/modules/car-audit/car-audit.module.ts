import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityModule } from '../security/security.module'
import { Car } from '../../models/renting/car.entity'
import { CarAudit } from '../../models/renting/car-audit.entity'
import { User } from '../../models/user.entity'
import { CarAuditService } from './car-audit.service'
import { CarAuditController } from './car-audit.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarAudit,
      Car,
      User
    ]),
    SecurityModule,
  ],
  providers: [
    CarAuditService,
  ],
  controllers: [
    CarAuditController,
  ],
  exports: [
    CarAuditService,
  ]
})
export class CarAuditModule { }
