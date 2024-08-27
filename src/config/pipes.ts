import { ValidationPipeOptions } from '@nestjs/common'

export const pipesConfig: ValidationPipeOptions = { whitelist: true, forbidNonWhitelisted: true }
