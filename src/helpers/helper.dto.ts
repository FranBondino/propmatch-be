import { IsOptional, IsString, IsUUID } from 'class-validator'

export class IdRequired {
  @IsString()
  @IsUUID('4')
  id: string
}

export class IdOptional {
  @IsOptional()
  @IsString()
  @IsUUID('4')
  id: string
}