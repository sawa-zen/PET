import { useEffect, useRef, useState } from 'react'

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const auioAnalyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0)

  const playAudio = async (arrayBuffer: ArrayBuffer) => {
    audioContextRef.current = new AudioContext()
    await audioContextRef.current.resume()
    audioSourceRef.current = audioContextRef.current.createBufferSource()

    const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer)
    audioSourceRef.current.buffer = decodedAudio
    audioSourceRef.current.start()
    audioSourceRef.current.onended = () => {
      setPlaying(false)
      audioSourceRef.current = null
    }

    auioAnalyserRef.current = audioContextRef.current.createAnalyser()
    auioAnalyserRef.current.fftSize = 256

    // ノードを接続: ソース -> アナライザー -> 出力
    audioSourceRef.current.connect(auioAnalyserRef.current)
    auioAnalyserRef.current.connect(audioContextRef.current.destination)

    setPlaying(true)
    updateVolume()
  }

  const stopAudio = () => {
    setPlaying(false)
    if (audioSourceRef.current) {
      audioSourceRef.current.stop()
      audioSourceRef.current.disconnect()
      audioSourceRef.current = null
    }

    if (audioContextRef.current) {
      // AudioContextを閉じる
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (auioAnalyserRef.current) {
      auioAnalyserRef.current.disconnect()
      auioAnalyserRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const updateVolume = () => {
    if (!auioAnalyserRef.current) return

    const bufferLength = auioAnalyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // 周波数データを取得
    auioAnalyserRef.current.getByteFrequencyData(dataArray)

    // 平均音量を計算
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const averageVolume = sum / dataArray.length

    // 音量を0-100の範囲に正規化
    setVolume(Math.min(100, averageVolume * 100 / 255))

    // アニメーションフレームを更新
    animationFrameRef.current = requestAnimationFrame(updateVolume)
  }

  // コンポーネントがマウントされたとき、または状態が変わったときに実行
  useEffect(() => {
    // AudioContextのクリーンアップ
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop()
        audioSourceRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    volume,
    playing,
    playAudio,
    stopAudio,
  }
}
