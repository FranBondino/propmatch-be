import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityModule } from '../security/security.module'
import { User } from '../../models/user.entity'
import { SessionAudit } from '../../models/session-audit.entity'
import { SessionAuditService } from './session-audit.service'
import { SessionAuditController } from './session-audit.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionAudit,
      User
    ]),
    forwardRef(() => SecurityModule), // Wrap the import in forwardRef
  ],
  providers: [
    SessionAuditService,
  ],
  controllers: [
    SessionAuditController,
  ],
  exports: [
    SessionAuditService,
  ]
})
export class SessionAuditModule { }
