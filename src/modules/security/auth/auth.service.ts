/* eslint-disable max-len */
import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { User } from '../../../models/user.entity'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { plainToClass } from 'class-transformer'
import { ResetPasswordToken } from '../../../types/types'
import { UserService } from '../user/user.service'
import {
  ILoginCredentialsDto,
  LoginDto,
  UpdatePasswordDto,
} from './auth.dto'
import { IJwtPayload } from './auth.interface'
import { errorsCatalogs } from '../../../catalogs/errors-catalogs'

const {
  EMAIL_OR_PASSWORD_INVALID,
} = errorsCatalogs


@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  private generateJWTPayload(user: User): IJwtPayload {
    return {
      id: user.id,
      createdAt: new Date()
    }
  }

  public async login(dto: LoginDto): Promise<ILoginCredentialsDto> {
    const { email, password } = dto

    let foundUser: User
    try {
      foundUser = await this.userService.getByEmail(email, {})
    } catch (error) {
      throw new UnauthorizedException(EMAIL_OR_PASSWORD_INVALID)
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, foundUser.password)
    if (!isPasswordValid) throw new UnauthorizedException(EMAIL_OR_PASSWORD_INVALID)

    const payload = this.generateJWTPayload(foundUser)
    const token = this.jwtService.sign(payload)

    const user = plainToClass(User, foundUser)

    return { user, token }
  }

  public async updatePassword(dto: UpdatePasswordDto, user: User): Promise<void> {
    const isPasswordValid: boolean = await bcrypt.compare(dto.currentPassword, user.password)
    if (!isPasswordValid) throw new UnauthorizedException()

    await this.userService.updatePassword(user.id, dto.newPassword)
  }

  public async generateTokenForNewUser(user: User): Promise<string> {
    const token: ResetPasswordToken = { userId: user.id }
    return this.jwtService.sign(token)
  }

  private generateLoginCredentials(foundUser: User): ILoginCredentialsDto {
    const payload = this.generateJWTPayload(foundUser)
    const token = this.jwtService.sign(payload)

    const user = plainToClass(User, foundUser)

    return { user, token }
  }

  public verifyToken(token: string): any {
    return this.jwtService.verify(token)
  }
}
