import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches
} from 'class-validator'
import { UserType, UserTypes } from '../../../types/types'
import {
  atLeastOneCapitalLetter,
  atLeastOneNumber,
  validCharacters
} from '../../../helpers/password.helper'


const { admin, user, owner } = UserType
const userTypes = [admin, user, owner]
export class CreateUserDto {
  @Length(2, 30)
  fullName: string

  @IsEmail()
  email: string

  @Length(6, 30)
  @Matches(atLeastOneCapitalLetter)
  @Matches(atLeastOneNumber)
  @Matches(validCharacters)
  password: string

  @IsIn(userTypes)
  @IsNotEmpty()
  type: UserTypes
}
export class UpdateUserDto {
  @IsUUID('4')
  id: string

  @IsOptional()
  @Length(2, 30)
  fullName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsIn(userTypes)
  type?: UserTypes

  @IsOptional()
  @Length(6, 30)
  @Matches(atLeastOneCapitalLetter)
  @Matches(atLeastOneNumber)
  @Matches(validCharacters)
  password?: string
}

export class UserPreferencesDto {
  @IsOptional()
  @IsString()
  preferredCity?: string;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsBoolean()
  pets?: boolean;

  @IsOptional()
  @IsNumber()
  noiseTolerance?: number;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  genderPreference?: string;
}

export class UpdateMyProfileDto {
  @Length(2, 30)
  fullName: string

  @IsOptional()
  @IsEmail()
  email: string
}

export class UserResponseDto {
  id: string

  fullName: string

  email: string
}
