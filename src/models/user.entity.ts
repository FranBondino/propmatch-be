import { Exclude } from 'class-transformer'
import { UserType, UserTypes } from '../types/types'
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Appointment } from './appointment.entity'

@Entity()
export class User extends BaseModel {
  @Column()
  fullName: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ default: UserType.user, type: 'varchar' })
  type: UserTypes

  @Exclude()
  @Column()
  password: string

  @Exclude()
  @Column({ nullable: true })
  lastForcedLogout: Date

  @OneToMany(() => Appointment, appointment => appointment.user, { nullable: true })
  appointments: Appointment[];
}
