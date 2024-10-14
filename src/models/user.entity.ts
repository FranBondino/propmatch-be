import { Exclude } from 'class-transformer'
import { UserPreferences, UserType, UserTypes } from '../types/types'
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Appointment } from './appointment.entity'
import { Car } from './renting/car.entity'
import { Apartment } from './renting/apartment.entity'

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

  @Column({ nullable: true })
  gender: 'male' | 'female'

  @Exclude()
  @Column()
  password: string

  @Exclude()
  @Column({ nullable: true })
  lastForcedLogout: Date

  @OneToMany(() => Apartment, (apartment) => apartment.owner, { nullable: true })
  apartments: Apartment[];

  @OneToMany(() => Car, (car) => car.owner, { nullable: true })
  cars: Car[];

  @OneToMany(() => Appointment, appointment => appointment.user, { nullable: true })
  appointments: Appointment[];

  @OneToMany(() => Appointment, appointment => appointment.owner, { nullable: true })
  ownedAppointments: Appointment[];

  @Column('json', { nullable: true })
  preferences: UserPreferences
}

