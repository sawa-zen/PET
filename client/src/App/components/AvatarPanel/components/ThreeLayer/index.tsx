import { useThree } from "@react-three/fiber"
import { Stats } from '@react-three/drei'
import { Avatar } from "./components/Avatar";

export const ThreeLayer = () => {
  useThree(({ camera }) => {
    camera.position.set(-0.05, 0.15, 0.4)
    camera.lookAt(-0.1, 0.15, 0)
    camera.updateProjectionMatrix()
  })

  return (
    <>
      <Stats />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={1}
      />
      <Avatar />
    </>
  )
}
