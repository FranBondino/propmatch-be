
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig } from '../../config/jwtconfig'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user/user.service'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { JwtStrategy } from './auth/auth.strategy'
import { LogService } from './log/log.service'
// eslint-disable-next-line
import { UserController } from './user/user.controller'
import { UserUtilsImpl, USER_UTILS } from './user/user-utils/user.utils'
import { User } from '../../models/user.entity'
import { Log } from '../../models/log.entity'
import { BannedToken } from '../../models/banned-token.entity'


@Module({
  imports: [
    JwtModule.register(jwtConfig),
    PassportModule,
    TypeOrmModule.forFeature([
      User,
      Log,
      BannedToken
    ]),
  ],
  controllers: [
    AuthController,
    UserController
  ],
  providers: [
    {
      provide: USER_UTILS,
      useClass: UserUtilsImpl
    },
    UserService,
    AuthService,
    JwtStrategy,
    LogService,
  ],
  exports: [
    UserService,
    LogService,
    JwtModule,
    AuthService,
  ]
})
export class SecurityModule { }
