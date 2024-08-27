import {
  Injectable,
  Logger,
  NestMiddleware
} from '@nestjs/common'
import { Request, NextFunction } from 'express'
import { v4 } from 'uuid'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('REQ')

  use(req: Request, res: any, next: NextFunction) {
    res.txid = v4()
    const bodyEmpty = Object.values(req.body).length < 1

    this.logger.debug(`${res.txid} >> ${req.method} - ${req.originalUrl}`)
    if (req.body && !bodyEmpty) this.logger.debug(`${JSON.stringify(req.body, null, 2)}`)
    next()
  }
}
