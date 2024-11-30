import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { Paginated, UserType, PaginateQueryRaw } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { SessionAuditService } from './session-audit.service'
import { SessionAudit } from '../../models/session-audit.entity'

const { admin } = UserType

@Controller('session-audits')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class SessionAuditController {
  constructor(
    private readonly service: SessionAuditService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<SessionAudit>> {
    return this.service.getAll(query)
  }
}
