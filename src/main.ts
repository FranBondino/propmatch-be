import * as dotenv from 'dotenv'
dotenv.config()

const { COMPRESSION_ENABLED, ENV, ENABLE_SWAGGER } = process.env
// const isDev = ENV === 'DEV'
const isProd = ENV === 'PROD'
const isSwaggerEnabled = ENABLE_SWAGGER === 'true'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LogUnhandledErrorFilter } from './filters/log.filter'
import { checkEnvironmentVars } from './helpers/env.helper'
import * as compression from 'compression'
import helmet from 'helmet'
import { helmetOptions } from './config/helmet'
import { HttpExceptionFilter } from './filters/http.filter'
import { TrimPipe } from './helpers/pipes/trim.pipe'
import { SwaggerModule } from '@nestjs/swagger'
import { swaggerConfig } from './config/swagger'
import metadata from './metadata'

async function bootstrap() {
  checkEnvironmentVars()
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'error', 'verbose', 'warn'],
  })

  if (isSwaggerEnabled) {
    await SwaggerModule.loadPluginMetadata(metadata)
    const document = SwaggerModule.createDocument(app, swaggerConfig)

    SwaggerModule.setup('/docs', app, document, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  }

  app.use(helmet(helmetOptions))
  app.enableCors()
  if (COMPRESSION_ENABLED === 'true') app.use(compression())
  app.useGlobalPipes(
    new ValidationPipe({ transform: true }),
    new TrimPipe()
  )
  app.useGlobalFilters(new LogUnhandledErrorFilter())
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.PORT)
}
bootstrap()
