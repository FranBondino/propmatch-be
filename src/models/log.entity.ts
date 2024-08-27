import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { User } from './user.entity'

@Entity()
export class Log extends BaseModel {
  @Column()
  resource: string

  @Column()
  resourceId: string

  @Column()
  action: string

  @Column({ nullable: true })
  data: string

  @ManyToOne(() => User)
  executingUser: User
}
