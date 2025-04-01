import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect } from 'react'
import { io } from 'socket.io-client'
import './styles.css'

const socket = io('http://localhost:3000')

export const App = () => {
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
    console.log('Received message from server:', event.message)
  }, [])
  const handleDisconnect = useCallback(() => { console.log('Disconnected from server') }, [])

  const handleClick = useCallback(() => {
    console.log('Button clicked')
    socket.emit('c_send_message', { message: 'Hello from client!' })
  }, [])

  return (
    <div id="root">
      <button onClick={handleClick}>test</button>
      <div className='three-container'>
        <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </Canvas>
      </div>
    </div>
  )
}
