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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApartmentAuditService } from './apartment-audit.service'
import { ApartmentAudit } from '../../models/renting/apartment-audit.entity'

const { admin } = UserType

@Controller('apartment-audits')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/apartment-audit')
export class ApartmentAuditController {
  constructor(
    private readonly service: ApartmentAuditService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<ApartmentAudit>> {
    return this.service.getAll(query)
  }
}
