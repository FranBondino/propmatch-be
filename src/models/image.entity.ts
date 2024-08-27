
import {
  Column,
  Entity,
} from 'typeorm'
import { BaseModel } from './base-model.entity'

@Entity()
export class Image extends BaseModel {
  @Column()
  key: string

  @Column({ default: 0 })
  order: number

  @Column()
  url: string

  @Column({ default: new Date() })
  date: Date
}
