import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator'

export class CreateApartmentRentDto {
  @IsNumber()
  cost: number

  @IsDateString()
  startedAt: Date

  @IsDateString()
  endedAt: Date

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
