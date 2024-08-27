import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import * as dotenv from 'dotenv'
import { Logger } from '@nestjs/common'

dotenv.config()

export class SocketAdapter extends IoAdapter {
  protected readonly logger = new Logger('SocketAdapter')

  createIOServer(port: number, options?: ServerOptions & { namespace?: string, server: any }) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.SOCKET_ORIGIN,
        methods: ['GET', 'POST']
      }
    })
    return server
  }
}
