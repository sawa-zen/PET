import { useEffect, useRef } from 'react'
import { VRM } from '@pixiv/three-vrm'

interface Props {
  vrm: VRM | null
  speaking: boolean
}

export const useLipSync = ({ vrm, speaking }: Props) => {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!vrm) return

    const updateMouth = () => {
      // ランダムな口の開き具合（0.0 ~ 0.5の間）
      const value = speaking ? Math.random() * 0.5 : 0

      // "aa"（あ）の表情を使って口を開く
      vrm.expressionManager?.setValue('aa', value)
      vrm.expressionManager?.update()

      // 次のアニメーションのタイミングをランダムに設定（50ms ~ 200msの間）
      timerRef.current = window.setTimeout(updateMouth, 50 + Math.random() * 150)
    }

    // 初回実行
    updateMouth()

    // クリーンアップ
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      // 口を閉じる
      if (vrm.expressionManager) {
        vrm.expressionManager.setValue('aa', 0)
        vrm.expressionManager.update()
      }
    }
  }, [speaking, vrm])
}
