import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Type,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { plainToClassFromExist } from 'class-transformer'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { Paginated, Response } from '../types/types'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger('RES')

  constructor(private readonly reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const Type = this.reflector.get<any>('Type', context.getHandler())
    const res = context.switchToHttp().getResponse()
    return next.handle().pipe(
      map((data) => ({
        status: true, // Once the desktop app is gone we will remove this.
        message: 'Ok', // We will tackle this later.
        data: Type
          ? plainToClassFromExist(new Paginated<Type>(Type), data)
          : data,
      })),
      tap((payload) =>
        this.logger.debug(
          `${res.txid} << ${res.statusCode} - ${JSON.stringify(
            payload.data,
            null,
            2
          )} `
        )
      )
    )
  }
}
