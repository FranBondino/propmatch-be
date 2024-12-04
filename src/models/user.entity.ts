import { Exclude } from 'class-transformer'
import { UserPreferences, UserType, UserTypes } from '../types/types'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Appointment } from './appointment.entity'
import { Car } from './renting/car.entity'
import { Apartment } from './renting/apartment.entity'
import { Expense } from './renting/expense.entity'

@Entity()
export class User extends BaseModel {
  @Column()
  fullName: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: number

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

  @OneToMany(() => Expense, (expense) => expense.owner, { nullable: true })
  expenses: Expense[];

  @OneToMany(() => Appointment, appointment => appointment.user, { nullable: true })
  appointments: Appointment[];

  @OneToMany(() => Appointment, appointment => appointment.owner, { nullable: true })
  ownedAppointments: Appointment[];

  // Self-referencing many-to-many relationship for contacts
  @ManyToMany(() => User, (user) => user.contacts, { nullable: true })
  @JoinTable()
  contacts: User[];

  @Column('json', { nullable: true })
  preferences: UserPreferences

}

