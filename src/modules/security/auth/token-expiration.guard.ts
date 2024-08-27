import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class TokenExpirationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token: string = request.body.token

    try {
      this.jwtService.verify(token)
    } catch (error) {
      throw new UnauthorizedException('Token expired')
    }

    return true
  }
}
