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
  @Column({ type: 'timestamp', nullable: true })
  startTime: Date

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date

  @Column()
  status: 'Pendiente' | 'Confirmado' | 'Cancelado'

  @ManyToOne(() => Apartment, { nullable: true })
  apartment: Relation<Apartment>

  @ManyToOne(() => User, { nullable: true })
  user: Relation<User>

  @ManyToOne(() => User, { nullable: true })
  owner: Relation<User>
}
