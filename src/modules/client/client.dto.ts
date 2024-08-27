import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { GenderTypes } from '../../types/types'

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsOptional()
  @IsString()
  fullAddress?: string

  @IsOptional()
  @IsString()
  phoneNumber?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  gender?: GenderTypes
}

export class UpdateClientDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsString()
  fullName: string

  @IsOptional()
  @IsString()
  fullAddress?: string

  @IsOptional()
  @IsString()
  phoneNumber?: string

  @IsOptional()
  @IsEmail()
  email?: string
}
