import { Exclude } from 'class-transformer'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class UnhandledErrorData extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  data: string

  @Exclude()
  @CreateDateColumn()
  createdAt: Date
}
