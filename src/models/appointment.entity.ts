import {
  Column,
  Entity,
  ManyToOne,
  Relation,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Apartment } from './renting/apartment.entity'
import { User } from './user.entity'
import { Car } from './renting/car.entity'

@Entity()
export class Appointment extends BaseModel {
  @Column()
  date: Date

  @Column()
  status: 'pending' | 'accepted' | 'rejected'

  @ManyToOne(() => Apartment, {nullable: true})
  apartment: Relation<Apartment>

  @ManyToOne(() => Car, {nullable: true})
  car: Relation<Car>

  @ManyToOne(() => User, {nullable: true})
  user: Relation<User>
}
