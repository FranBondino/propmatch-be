import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator'

export class CreateAgencyProcedureDto {
  @IsNumber()
  cost: number

  @IsDateString()
  date: Date

  @IsString()
  @IsNotEmpty()
  description: string

  @IsOptional()
  @IsUUID()
  clientId?: string
}

export class UpdateAgencyProcedureDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsNumber()
  cost?: number

  @IsOptional()
  @IsDateString()
  date?: Date

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  clientId?: string
}
