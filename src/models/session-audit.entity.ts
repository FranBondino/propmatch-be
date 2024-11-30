import {
  Column,
  Entity,
  ManyToOne,
  Relation,
} from 'typeorm'
import { User } from './user.entity'
import { BaseModel } from './base-model.entity';

@Entity()
export class SessionAudit extends BaseModel {
  @ManyToOne(() => User)
  user: Relation<User>

  @Column()
  action: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date; // Timestamp of the change
}
