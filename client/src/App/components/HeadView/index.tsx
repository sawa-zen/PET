import { useEffect, useState } from 'react'
import styles from './styles.module.css'

interface Props {
  className?: string
  volume: number
  message?: string
  thinking?: boolean
}

export const HeadView = ({
  className,
  volume,
  message = '',
  thinking = false,
}: Props) => {
  const [dots, setDots] = useState(1)
  const opacity = Math.min(1, volume * 0.05)
  const borderColor = `rgba(69, 182, 200, ${opacity})`

  useEffect(() => {
    if (!thinking) { setDots(1); return }
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 500)
    return () => clearInterval(interval)
  }, [thinking])

  return (
    <div className={`${className} ${styles.wrapper}`}>
      <div className={styles.nameplate} style={{ borderColor }}>
        ずんだもん
      </div>
      <div className={styles.messageContainer}>
        {message ? (
          <div className={styles.messageCard}>
            <div>{message}</div>
          </div>
        ) : null}
        {thinking ? (
          <div className={`${styles.messageCard} ${styles.thinking}`}>
            <div>{'・'.repeat(dots)}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
