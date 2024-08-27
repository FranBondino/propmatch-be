import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
// eslint-disable-next-line
import { Request, Response } from 'express'
import { UnhandledError } from '../errors/unhandled.error'

@Catch()
export class LogUnhandledErrorFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('CATCH')

  async catch(exception: any, host: ArgumentsHost) {

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const url = request.url


    if (exception instanceof HttpException) response.send(exception.getResponse())
    else {
      const ex = new UnhandledError(exception, url)

      const data = ex.display()
      this.logger.error(data)


      const statusCode = 500

      response.status(statusCode).json({ statusCode, message: 'error 500' })
    }
  }
}
