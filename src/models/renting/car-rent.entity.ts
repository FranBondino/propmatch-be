import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Car } from './car.entity'
import { Client } from './client.entity'

@Entity()
export class CarRent extends BaseModel {
  @Column()
  cost: number

  @Column()
  startedAt: Date

  @Column()
  endedAt: Date

  @ManyToOne(() => Car)
  car: Car

  @ManyToOne(() => Client, { nullable: true })
  client?: Client
}
