import { FormEvent, useCallback, useRef } from "react"
import { ChatMessage } from "../../types"
import styles from "./styles.module.css"

interface Props {
  className?: string
  messages: ChatMessage[]
  onClickSubmit: (text: string) => void
}

export const ChatPanel = ({ className, messages, onClickSubmit }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClickSubmit = useCallback((event: FormEvent) => {
    event.preventDefault()
    if (!inputRef.current || !inputRef.current.value) return
    onClickSubmit(inputRef.current.value)
    inputRef.current.value = ""
  }, [])

  return (
    <div className={[className, styles.wrapper].join(" ")}>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={[
              styles.message,
              message.role
            ].join(" ")}
          >
            <span className={styles.role}>
              {message.role === 'user' ? 'あなた' : 'PET'}
            </span>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      <form className={styles.formRow} onSubmit={handleClickSubmit}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
        />
        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}
