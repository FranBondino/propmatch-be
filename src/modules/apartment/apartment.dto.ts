import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateApartmentDto {
  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @IsNotEmpty()
  fullAddress: string
}

export class UpdateApartmentDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  fullAddress?: string
}
