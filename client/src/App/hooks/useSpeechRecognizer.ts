import { useCallback, useEffect, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface Props {
  onRecognitionEnd: (transcript: string) => void
}

export const useSpeechRecognizer = ({ onRecognitionEnd }: Props) => {
  const [isListening, setIsListening] = useState(true)
  const { transcript } = useSpeechRecognition({ transcribing: isListening })

  const handleRecognitionEnd = useCallback(() => {
    if (isListening) {
      SpeechRecognition.startListening()
    }
    if (!transcript) return
    onRecognitionEnd(transcript)
  }, [isListening, onRecognitionEnd, transcript])

  const toggleListening = useCallback(() => {
    if (isListening) {
      SpeechRecognition.stopListening()
    } else {
      SpeechRecognition.startListening()
    }
    setIsListening(!isListening)
  }, [isListening])

  useEffect(() => {
    if (isListening) {
      SpeechRecognition.startListening()
    }
  }, [isListening])

  // マイクの状態を監視して、停止した場合に再開する
  useEffect(() => {
    SpeechRecognition.getRecognition()?.addEventListener('end', handleRecognitionEnd)
    return () => {
      SpeechRecognition.getRecognition()?.removeEventListener('end', handleRecognitionEnd)
    }
  }, [handleRecognitionEnd])

  return {
    transcript,
    isListening,
    toggleListening,
  }
}
