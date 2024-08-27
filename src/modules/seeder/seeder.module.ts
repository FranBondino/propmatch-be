import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityModule } from '../security/security.module'
import { SeederService } from './seeder.service'
import { User } from '../../models/user.entity'


@Module({
  imports: [
    SecurityModule,
    TypeOrmModule.forFeature([
      User
    ]),
  ],
  providers: [
    SeederService
  ],
  exports: [
    SeederService
  ]
})
export class SeederModule { }
