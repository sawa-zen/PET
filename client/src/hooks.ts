import { useCallback, useEffect, useState } from "react"
import type { Socket } from "socket.io-client"
import type { ChatMessage } from "./types"

interface Props {
  socket: Socket
}

export const useApp = ({ socket }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    socket.on('connect', handleConnect)
    socket.on('s_send_message', handleServerSendMessage)
    socket.on('disconnect', handleDisconnect)
    return () => {
      socket.off('connect', handleConnect)
      socket.off('s_send_message', handleServerSendMessage)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  const handleConnect = useCallback(() => { console.log('Connected to server') }, [])

  const handleServerSendMessage = useCallback((event: { message: string }) => {
    setThinking(false)
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: event.message
    }])
  }, [])
  const handleDisconnect = useCallback(() => { console.log('Disconnected from server') }, [])

  const handleClick = useCallback((text: string) => {
    setThinking(true)
    setMessages((prev) => [...prev, {
      role: 'user',
      content: text
    }])
    socket.emit('c_send_message', { message: text })
  }, [])

  return {
    thinking,
    messages,
    handleClick,
  }
}