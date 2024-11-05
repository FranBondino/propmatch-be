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
export class Car extends BaseModel {
  @Column()
  make: string

  @Column()
  model: string

  @Column()
  color: string

  @Column({ nullable: true })
  licensePlate?: string

  @Column()
  yearOfManufacturing: number

  @ManyToOne(() => User, (user) => user.cars)
  owner: Relation<User>
}
