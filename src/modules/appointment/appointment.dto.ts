import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator'

export class CreateAppointmentDto {
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsUUID()
  apartmentId?: string;

  @IsOptional()
  @IsUUID()
  carId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}  

export class UpdateAppointmentStatusDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';
}