import { Mic, Slash } from '@kurone-kito/launchpad-icons-react'
import { Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Avatar } from './components/Avatar'
import { HeadView } from './components/HeadView'
import { PreviewContainer } from './components/PreviewContainer'
import { useApp } from './hooks/useApp'
import styles from './styles.module.css'

const DEBUG = false

export const App = () => {
  const {
    inputRef,
    transcript,
    volume,
    message,
    speaikng,
    thinking,
    avatarMotion,
    handleSubmit,
    isListening,
    toggleListening,
  } = useApp()

  return (
    <div id="root" className={styles.wrapper}>
      <div className={styles.mainContainer}>
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ fov: 60, near: 0.001, far: 100 }}
        >
          {DEBUG ? (<Stats />) : null}
          <ambientLight intensity={1} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            decay={0}
            intensity={0.5}
          />
          <Avatar
            speaking={speaikng}
            avatarMotion={avatarMotion}
          />
        </Canvas>
        <HeadView
          className={styles.headView}
          volume={volume}
          message={message}
          thinking={thinking}
        />
        <div className={styles.transcriptPanel}>
          <div
            className={styles.micIconWrapper}
            style={{ cursor: 'pointer' }}
            onClick={toggleListening}
          >
            <Mic
              className={styles.micIcon}
              style={{
                opacity: isListening ? (transcript ? 0.7 : 0.1) : 0.7,
                scale: isListening ? (transcript ? 1 : 0.5) : 1,
              }}
            />
            {!isListening && (
              <Slash className={styles.slashIcon} />
            )}
          </div>
          <div>{transcript} {DEBUG ? avatarMotion : ''}</div>
        </div>
        {DEBUG ? (
          <form
            className={styles.formRow}
            onSubmit={handleSubmit}
          >
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
            />
            <button type="submit">
              Submit
            </button>
          </form>
        ) : null}
      </div>
      <PreviewContainer />
    </div>
  )
}
