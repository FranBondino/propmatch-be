import {
  Column,
  Entity,
  ManyToOne,
  Relation,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { Car } from './car.entity'
import { User } from '../user.entity'

@Entity()
export class CarAudit extends BaseModel {
  @ManyToOne(() => User)
  user: Relation<User>

  @ManyToOne(() => Car)  // Corrected to use ManyToOne decorator
  car: Relation<Car>

  @Column()
  action: string

  @Column({ type: 'json', nullable: true })
  changes: {
    old: Record<string, any>;
    new: Record<string, any>;
  }

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date; // Timestamp of the change
}
