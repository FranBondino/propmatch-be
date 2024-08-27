import { AuthService } from './../modules/security/auth/auth.service'
import { IJwtPayload } from '../modules/security/auth/auth.interface'
import { Socket } from 'socket.io'
import { WsException } from '@nestjs/websockets'

export interface SocketWithAuth extends Socket {
  decodedToken: IJwtPayload
  token: string,
  meetingInstanceId: string
  inMeetingDataId: string
  currentEvent: string
}

export const emitError = (client: SocketWithAuth, message: string) => {
  client.emit('exception', message)
  client.disconnect()
  throw new WsException(message)
}

export const authWSS = (client: SocketWithAuth, authService: AuthService) => {
  const { token } = client.handshake.auth
  if (!token) emitError(client, 'Token was not provided')

  const realToken = token.split(' ')[1]
  if (!realToken) emitError(client, 'Token is not in the format [Bearer TOKEN]')

  let decodedToken: IJwtPayload
  try {
    decodedToken = <IJwtPayload>authService.verifyToken(realToken)
  } catch (error) {
    emitError(client, 'Token expired or invalid')
  }
  client.decodedToken = decodedToken
  client.token = realToken
  client.emit('authorized', 'Successfully authorized')
}
