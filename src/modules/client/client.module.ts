import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientService } from './client.service'
import { ClientController } from './client.controller'
import { SecurityModule } from '../security/security.module'
import { Client } from '../../models/renting/client.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client
    ]),
    SecurityModule,
  ],
  providers: [
    ClientService,
  ],
  controllers: [
    ClientController,
  ],
  exports: [
    ClientService,
  ]
})
export class ClientModule { }
