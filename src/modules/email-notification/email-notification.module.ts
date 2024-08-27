import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';

@Module({
  providers: [EmailNotificationService],
  exports: [EmailNotificationService], // Export to be used in other modules
})

export class EmailNotificationModule {}
