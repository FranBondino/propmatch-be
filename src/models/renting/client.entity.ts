import {
  Column,
  Entity,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { GenderTypes } from '../../types/types'

@Entity()
export class Client extends BaseModel {
  @Column()
  fullName: string

  @Column({ nullable: true })
  fullAddress?: string

  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  phoneNumber?: string

  @Column({ nullable: true, type: 'varchar' })
  gender?: GenderTypes
}
