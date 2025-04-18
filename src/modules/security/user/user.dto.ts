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
import { Transform } from 'class-transformer'


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
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  phone: number

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
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @Transform(({ value }) => 
    value === 'true' || value === true || value === 'Yes' ? true : 
    value === 'false' || value === false || value === 'No' ? false : value
  )  // Handle "Yes" and "No" as booleans
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @Transform(({ value }) => 
    value === 'true' || value === true || value === 'Yes' ? true : 
    value === 'false' || value === false || value === 'No' ? false : value
  )  // Handle "Yes" and "No" as booleans
  @IsBoolean()
  pets?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

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

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))  // Transform string to number
  @IsNumber()
  phone: number
}

export class UserResponseDto {
  id: string

  fullName: string

  email: string
}
