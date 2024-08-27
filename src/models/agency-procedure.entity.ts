import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Client } from '../models/renting/client.entity'

@Entity()
export class AgencyProcedure extends BaseModel {
  @Column()
  description: string

  @Column()
  cost: number

  @Column()
  date: Date

  @Column({ nullable: true })
  clientId?: string

  @ManyToOne(() => Client, { nullable: true })
  client?: Client
}
