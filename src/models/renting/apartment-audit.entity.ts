import {
  Column,
  Entity,
  ManyToOne,
  Relation,
} from 'typeorm'
import { BaseModel } from '../base-model.entity'
import { User } from '../user.entity'
import { Apartment } from './apartment.entity'

@Entity()
export class ApartmentAudit extends BaseModel {
  @ManyToOne(() => User)
  user: Relation<User>

  @ManyToOne(() => Apartment)  // Corrected to use ManyToOne decorator
  apartment: Relation<Apartment>

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
