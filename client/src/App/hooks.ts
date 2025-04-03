import { useCallback, useEffect, useState, useRef } from "react"
import type { Socket } from "socket.io-client"
import type { ChatMessage } from "../types"
import { VoiceboxClient } from "../libs/VoiceboxClient"

interface Props {
  socket: Socket
}

export const useApp = ({ socket }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [thinking, setThinking] = useState(false)
  const voiceboxClient = useRef<VoiceboxClient>(new VoiceboxClient())

  const playVoice = useCallback(async (text: string) => {
    try {
      const query = await voiceboxClient.current.audioQuery(text)
      const audioBuffer = await voiceboxClient.current.synthesis(query)
      const context = new AudioContext()
      const source = context.createBufferSource()
      const decodedAudio = await context.decodeAudioData(audioBuffer)
      source.buffer = decodedAudio
      source.connect(context.destination)
      source.start()
    } catch (error) {
      console.error('音声再生エラー:', error)
    }
  }, [])

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
    playVoice(event.message)
  }, [playVoice])
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
