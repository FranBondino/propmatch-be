import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsBoolean,
} from 'class-validator'
import { ExpenseType } from '../../types/types'
import { Transform } from 'class-transformer'

export class CreateExpenseDto {
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  @IsNotEmpty()
  cost: number

  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  @IsNotEmpty()
  date: Date

  @IsOptional()
  @Transform(({ value }) => 
    value === 'true' || value === true || value === 'Yes' ? true : 
    value === 'false' || value === false || value === 'No' ? false : value
  )  // Handle "Yes" and "No" as booleans
  @IsBoolean()
  recurring?: Boolean

  @IsString()
  @IsNotEmpty()
  description: string

  @IsOptional()
  @IsUUID()
  apartmentId: string
}

export class UpdateExpenseDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  cost: number

  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  date?: Date

  @IsOptional()
  @Transform(({ value }) => 
    value === 'true' || value === true || value === 'Yes' ? true : 
    value === 'false' || value === false || value === 'No' ? false : value
  )  // Handle "Yes" and "No" as booleans
  @IsBoolean()
  recurring?: Boolean

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  apartmentId?: string

}
