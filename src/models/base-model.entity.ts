import { Exclude } from 'class-transformer'
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date

  @Exclude()
  @CreateDateColumn()
  createdAt: Date
}
