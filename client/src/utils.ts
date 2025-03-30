import { io, type Socket } from 'socket.io-client'
import type { SocketEvents } from './types'

export const socketClient: Socket<SocketEvents> = io(import.meta.env.VITE_BACKEND_ENDPOINT)
