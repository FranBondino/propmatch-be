/* eslint-disable @typescript-eslint/dot-notation */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException')

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const data: any = exception.getResponse()
    const errorStatus = exception.getStatus()

    const status = data.httpStatus || errorStatus

    this.logger.debug(
      `${(response as any).txid} << ${status} - ${JSON.stringify(data, null, 2)} `
    )

    response
      .status(status)
      .json(data)
  }
}