import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator'

export class CreateApartmentRentDto {
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  cost: number

  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  startedAt: string

  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  endedAt: string

  @IsUUID()
  apartmentId: string

  @IsOptional()
  @IsUUID()
  clientId: string
}

export class UpdateApartmentRentDto {
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
  startedAt?: Date

  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDateString()
  endedAt?: Date

  @IsOptional()
  @IsUUID()
  clientId?: string
}
