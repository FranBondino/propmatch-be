import {
  Column,
  Entity,
} from 'typeorm'
import { BaseModel } from './base-model.entity'

@Entity()
export class BannedToken extends BaseModel {
  @Column()
  token: string

  @Column()
  type: string
}
