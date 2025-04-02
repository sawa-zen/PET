import { io } from 'socket.io-client'
import { useApp } from './hooks'
import { ChatPanel } from './components/ChatPanel'
import styles from './styles.module.css'
import { AvatarPanel } from './components/AvatarPanel'

const socket = io('http://localhost:3000')

export const App = () => {
  const { messages, handleClick } = useApp({ socket })

  return (
    <div id="root" className={styles.wrapper}>
      <AvatarPanel
        className={styles.avatarPanel}
      />
      <ChatPanel
        messages={messages}
        onClickSubmit={handleClick}
      />
    </div>
  )
}
