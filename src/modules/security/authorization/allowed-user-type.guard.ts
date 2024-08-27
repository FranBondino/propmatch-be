import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ReqUser } from '../auth/auth.strategy'
import { ALLOWED_USERS } from './permission.decorator'

@Injectable()
export class AllowedUsersGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const types = this.reflector.get<string[]>(ALLOWED_USERS, context.getClass())
    const request = context.switchToHttp().getRequest()
    const user = request.user as ReqUser
    if (!types || types?.length === 0) return true

    let canActivate = false

    for (const type of types) {
      if (user.type === type) {
        canActivate = true
        break
      }
    }

    return canActivate
  }
}
