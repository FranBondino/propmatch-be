import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator'
import { User } from '../../../models/user.entity'
import { Match } from '../../../helpers/match.decorator'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  password: string
}

export class UpdatePasswordDto {
  @Length(6, 30)
  currentPassword: string

  @Length(6, 30)
  newPassword: string

  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  repeatNewPassword: string
}

export class ILoginCredentialsDto {
  user: User

  token: string
}