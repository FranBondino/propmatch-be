import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Expense } from './expense.entity'
import { Appointment } from '../appointment.entity'

@Entity()
export class Apartment extends BaseModel {
  @Column()
  city: string

  @Column()
  fullAddress: string

  @OneToMany(() => Expense, (expense) => expense.apartment, { nullable: true })
  expenses: Expense[]

  @OneToMany(() => Appointment, appointment => appointment.apartment, { nullable: true })
  appointments: Appointment[];
}