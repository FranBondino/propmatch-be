import {
  Column,
  Entity,
  ManyToOne,
  Relation,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Apartment } from './apartment.entity'
import { ExpenseType } from '../../types/types'
import { Car } from './car.entity'
import { User } from '../user.entity'

@Entity()
export class Expense extends BaseModel {
  @Column()
  description: string

  @Column()
  date: Date

  @Column()
  cost: number

  @ManyToOne(() => User, (user) => user.expenses)
  owner: Relation<User>

  @ManyToOne(() => Apartment, {nullable: true})
  apartment: Relation<Apartment>

  @ManyToOne(() => Car, {nullable: true})
  car: Relation<Car>

  @Column({ type: 'varchar', nullable: true })
  type: ExpenseType
}
