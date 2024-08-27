import { Server as ServerIO } from 'socket.io'

export let io: ServerIO

export const setGlobalWSS = (server: ServerIO) => {
  io = server
}
