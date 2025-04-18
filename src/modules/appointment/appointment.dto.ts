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
  startTime: Date;

  @IsOptional()
  @IsUUID()
  apartmentId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class UpdateAppointmentStatusDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEnum(['Confirmado', 'Cancelado'])
  status: 'Confirmado' | 'Cancelado';
}