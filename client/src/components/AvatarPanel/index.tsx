import { Canvas } from "@react-three/fiber"
import styles from "./styles.module.css"
import { ThreeLayer } from "./components/ThreeLayer"

interface Props {
  className?: string
}

export const AvatarPanel = ({ className }: Props) => {
  return (
    <div className={[className, styles.wrapper].join(" ")}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
        <ThreeLayer />
      </Canvas>
    </div>
  )
}