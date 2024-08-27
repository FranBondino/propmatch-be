import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AgencyProcedureService } from './agency-procedure.service'
import { AgencyProcedureController } from './agency-procedure.controller'
import { SecurityModule } from '../security/security.module'
import { ClientModule } from '../client/client.module'
import { AgencyProcedure } from '../../models/agency-procedure.entity'
import { Client } from '../../models/renting/client.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgencyProcedure,
      Client
    ]),
    SecurityModule,
    ClientModule
  ],
  providers: [
    AgencyProcedureService,
  ],
  controllers: [
    AgencyProcedureController,
  ],
  exports: [
    AgencyProcedureService,
  ]
})
export class AgencyProcedureModule { }
