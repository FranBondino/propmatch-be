import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
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


const { admin, user } = UserType
const userTypes = [admin, user]
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
