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
import { CarAuditService } from './car-audit.service'
import { CarAudit } from '../../models/renting/car-audit.entity'

const { admin } = UserType

@Controller('car-audits')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/car-audit')
export class CarAuditController {
  constructor(
    private readonly service: CarAuditService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<CarAudit>> {
    return this.service.getAll(query)
  }
}
