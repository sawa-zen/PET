import { VRM } from "@pixiv/three-vrm"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

interface Props {
  vrm: VRM | null
}

export const useBlink = ({ vrm }: Props) => {
  const blinkTimeRef = useRef<number>(0)
  const nextBlinkTimeRef = useRef<number>(2) // 次の瞬きまでの時

  useFrame((_state, delta) => {
    if (!vrm) return
    blinkTimeRef.current += delta

    // 次の瞬きの時間になったら
    if (blinkTimeRef.current >= nextBlinkTimeRef.current) {
      // 瞬きの時間をリセット
      blinkTimeRef.current = 0
      // 次の瞬きまでの時間をランダムに設定（2-6秒）
      nextBlinkTimeRef.current = 2 + Math.random() * 4
    }

    // 瞬きのアニメーション（0.2秒で完了）
    const blinkValue = blinkTimeRef.current < 0.2
      ? Math.sin(Math.PI * (blinkTimeRef.current / 0.2))
      : 0

    // 両目の瞬きを設定
    vrm.expressionManager?.setValue('blink', blinkValue)
    vrm.expressionManager?.update()
  })
}