import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Mesh } from "three"

export const ThreeLayer = () => {
  const cubeRef = useRef<Mesh>(null)

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.01
      cubeRef.current.rotation.y += 0.01
      cubeRef.current.rotation.z += 0.01
    }
  })

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <mesh ref={cubeRef} rotation={[1, 0, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  )
}