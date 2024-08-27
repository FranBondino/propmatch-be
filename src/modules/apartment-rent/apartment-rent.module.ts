import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApartmentRentService } from './apartment-rent.service'
import { ApartmentRentController } from './apartment-rent.controller'
import { SecurityModule } from '../security/security.module'
import { ClientModule } from '../client/client.module'
import { ApartmentModule } from '../apartment/apartment.module'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Client } from '../../models/renting/client.entity'
import { Apartment } from '../../models/renting/apartment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApartmentRent,
      Client,
      Apartment
    ]),
    SecurityModule,
    ClientModule,
    ApartmentModule
  ],
  providers: [
    ApartmentRentService,
  ],
  controllers: [
    ApartmentRentController,
  ],
  exports: [
    ApartmentRentService,
  ]
})
export class ApartmentRentModule { }