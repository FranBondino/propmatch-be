import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator'

export class CreateCarRentDto {
  @IsNumber()
  cost: number

  @IsDateString()
  startedAt: Date

  @IsDateString()
  endedAt: Date

  @IsUUID()
  carId: string

  @IsOptional()
  @IsUUID()
  clientId: string
}

export class UpdateCarRentDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsNumber()
  cost: number

  @IsOptional()
  @IsDateString()
  startedAt?: Date

  @IsOptional()
  @IsDateString()
  endedAt?: Date

  @IsOptional()
  @IsUUID()
  clientId?: string
}