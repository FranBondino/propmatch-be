import { ArgumentsHost, Catch } from '@nestjs/common'
import { BaseWsExceptionFilter } from '@nestjs/websockets'
import { WSFException } from '../errors/wsf.expection'
import { SocketWithAuth } from '../helpers/socket-auth.helper'

@Catch()
export class WsFilter extends BaseWsExceptionFilter {
  catch(exception: any, context: ArgumentsHost) {
    const client = context.switchToWs().getClient<SocketWithAuth>()
    const ex = new WSFException(exception, client)
    client.emit('exception', ex)
  }
}
