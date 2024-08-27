import { BadRequestException } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { SocketWithAuth } from '../helpers/socket-auth.helper'

export interface WsExceptionWithStatus extends WsException {
  statusCode: number
}

export class WSFException {
  public name: string

  public messages: string[] = []

  public statusCode = 500

  public event: string

  constructor(ex: Error, client: SocketWithAuth) {
    this.event = client.currentEvent

    if (ex instanceof WsException) {
      this.name = 'WSException'
      this.messages = [ex.message]
      this.statusCode = (ex as WsExceptionWithStatus).statusCode
    } else if (ex instanceof BadRequestException) {
      const res: any = ex.getResponse()
      this.name = ex.name
      this.messages = (res as any).message
      this.statusCode = ex.getStatus()
    }
  }
}
