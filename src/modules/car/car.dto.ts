import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt
} from 'class-validator'

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  make: string

  @IsString()
  @IsNotEmpty()
  model: string

  @IsString()
  @IsNotEmpty()
  color: string

  @IsInt()
  yearOfManufacturing: number

  @IsOptional()
  @IsString()
  licensePlate?: string
}

export class UpdateCarDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsString()
  make?: string

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  licensePlate?: string

  @IsOptional()
  @IsInt()
  yearOfManufacturing?: number
}