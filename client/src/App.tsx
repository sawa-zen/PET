import { Canvas } from '@react-three/fiber'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import './styles.css'

export const App = () => {
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    })
  }, [])

  return (
    <div id="root">
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
