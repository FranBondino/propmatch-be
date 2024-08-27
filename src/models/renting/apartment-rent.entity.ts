import { Apartment } from './apartment.entity'
import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Client } from './client.entity'

@Entity()
export class ApartmentRent extends BaseModel {
  @Column()
  cost: number

  @Column()
  startedAt: Date

  @Column()
  endedAt: Date

  @ManyToOne(() => Apartment)
  apartment: Apartment

  @ManyToOne(() => Client, { nullable: true })
  client?: Client
}
