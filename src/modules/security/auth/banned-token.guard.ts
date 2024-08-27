import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { bannedTokenTypeCatalogs } from '../../../catalogs/banned-token.catalogs'
import { BannedToken } from '../../../models/banned-token.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class BannedTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(BannedToken)
    private readonly repository: Repository<BannedToken>
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token: string = request.body.token

    const bannedToken = await this.repository.findOne({ where: { token } })
    if (bannedToken) throw new UnauthorizedException(bannedTokenTypeCatalogs[bannedToken.type])

    return true
  }
}
