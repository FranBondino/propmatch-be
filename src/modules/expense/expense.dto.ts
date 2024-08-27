import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator'
import { ExpenseType } from '../../types/types'

export class CreateExpenseDto {
  @IsNumber()
  @IsNotEmpty()
  cost: number

  @IsDateString()
  @IsNotEmpty()
  date: Date

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  type: ExpenseType

  @IsOptional()
  @IsUUID()
  apartmentId: string

  @IsOptional()
  @IsUUID()
  carId: string
}

export class UpdateExpenseDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsNumber()
  cost: number

  @IsOptional()
  @IsDateString()
  date?: Date

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  apartmentId?: string

  @IsOptional()
  @IsUUID()
  carId?: string
}
