import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Expense } from './expense.entity'
import { Appointment } from '../appointment.entity'
import { User } from '../user.entity'

@Entity()
export class Apartment extends BaseModel {
  @Column()
  city: string

  @Column()
  fullAddress: string

  @ManyToOne(() => User, (user) => user.apartments)
  owner: Relation<User>

  @OneToMany(() => Expense, (expense) => expense.apartment, { nullable: true })
  expenses: Expense[]

  @OneToMany(() => Appointment, appointment => appointment.apartment, { nullable: true })
  appointments: Appointment[];
}