import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ResponseInterceptor } from '../../../helpers/response.interceptor'
import {
  ILoginCredentialsDto,
  LoginDto,
  UpdatePasswordDto,
} from './auth.dto'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { User } from '../../../models/user.entity'
import { AllowedUsers } from '../authorization/permission.decorator'
import { JwtAuthGuard } from './auth.guard'
import { AllowedUsersGuard } from '../authorization/allowed-user-type.guard'
import { UserType } from '../../../types/types'


@Controller('auth')
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Post('/login')
  public async login(@Body() dto: LoginDto): Promise<ILoginCredentialsDto> {
    return this.service.login(dto)
  }

  @Put('/logout')
  @UseGuards(JwtAuthGuard)
  public async logout(@Req() req: Request): Promise<void> {
    const user = req.user as User
    await this.service.logout(user.id)
  }

  @Put('/profile/update-password')
  @UseGuards(JwtAuthGuard, AllowedUsersGuard)
  public async updatePassword(@Body() dto: UpdatePasswordDto, @Req() req: Request): Promise<void> {
    const user = req.user as User
    await this.service.updatePassword(dto, user)
  }
}


