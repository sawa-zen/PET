import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import type { AvatarMotion, ServerSendMessageEvent, ServerToolResultEvent, ServerToolUseEvent } from '~/types'
import { socketClient } from '~/utils'
import { useAudio } from './useAudio'
import { useSpeechRecognizer } from './useSpeechRecognizer'

export const useApp = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string>('')
  const [thinking, setThinking] = useState(false)
  const [toolUsing, setToolUsing] = useState(false)
  const { playing: speaikng, volume, playAudio, stopAudio } = useAudio()

  const handleRecognitionEnd = useCallback((message: string) => {
    if (speaikng) return
    setThinking(true)
    socketClient.emit('c_send_message', {
      payload: { message },
    })
  }, [speaikng])

  const { transcript, isListening, toggleListening } = useSpeechRecognizer({ onRecognitionEnd: handleRecognitionEnd })

  const [, generateAudio] = useAsyncFn(async (payload: ServerSendMessageEvent['payload']) => {
    stopAudio()
    playAudio(payload.audioArrayBuffer)
    setMessage(payload.message)
  }, [])

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault()
    if (!inputRef.current) return
    const value = inputRef.current.value
    if (!value) return
    setThinking(true)
    socketClient.emit('c_send_message', { payload: { message: value } })
    inputRef.current.value = ''
  }, [])

  const handleGetMessage = useCallback((event: ServerSendMessageEvent) => {
    setThinking(false)
    generateAudio(event.payload)
    setToolUsing(false)
  }, [generateAudio])

  const handleGetToolUse = useCallback((event: ServerToolUseEvent) => {
    console.info('Tool use event:', event)
    setToolUsing(true)
  }, [])

  const handleGetToolResult = useCallback((event: ServerToolResultEvent) => {
    console.info('Tool result event:', event)
  }, [])

  const handleConversationTimeout = useCallback(() => {
    setMessage('')
    setThinking(false)
  }, [])

  const avatarMotion = useMemo<AvatarMotion>(() => {
    if (toolUsing) return 'search'
    return 'idle'
  }, [toolUsing])

  useEffect(() => {
    socketClient.on('s_send_message', handleGetMessage)
    socketClient.on('s_conversation_timeout', handleConversationTimeout)
    socketClient.on('s_tool_use', handleGetToolUse)
    socketClient.on('s_tool_result', handleGetToolResult)
    return () => {
      socketClient.off('s_send_message', handleGetMessage)
      socketClient.off('s_conversation_timeout', handleConversationTimeout)
      socketClient.off('s_tool_use', handleGetToolUse)
      socketClient.off('s_tool_result', handleGetToolResult)
    }
  }, [handleConversationTimeout, handleGetMessage, handleGetToolResult, handleGetToolUse])

  return {
    inputRef,
    transcript,
    message,
    volume,
    speaikng,
    thinking,
    toolUsing,
    avatarMotion,
    handleSubmit,
    isListening,
    toggleListening,
  }
}
