import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as dotenv from 'dotenv'
import { IJwtPayload } from './auth.interface'
import { UserService } from '../user/user.service'
import { errorsCatalogs } from '../../../catalogs/errors-catalogs'
import { Request } from 'express'
import { User } from '../../../models/user.entity'
dotenv.config()

const { NOT_AUTHENTICATED } = errorsCatalogs
export interface RequestConfig extends Request {
  cacheKey: string
}
export interface ReqUser extends User {
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: IJwtPayload) {
    return this.validateUser(payload)
  }

  private async validateUser(payload: IJwtPayload) {
    const { id, createdAt: tokenCreatedAt } = payload

    let user: User
    try {
      user = await this.userService.getById(id, null)
    } catch (error) {
      throw new UnauthorizedException(NOT_AUTHENTICATED)
    }

    // in the first implementation, users that are already logged in will not have the createdAt in their current token
    // if the token was created before the last force logout it means it's old and user needs to re-login.
    const tokenIsOld = new Date(tokenCreatedAt) <= new Date(user.lastForcedLogout)

    if (!tokenCreatedAt || (user.lastForcedLogout && tokenIsOld)) {
      throw new UnauthorizedException(NOT_AUTHENTICATED)
    }

    // this will be populated inside the req.user
    return { ...user }
  }
}
