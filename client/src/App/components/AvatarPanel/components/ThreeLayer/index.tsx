import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState, useCallback } from "react"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Stats } from '@react-three/drei'
import { AnimationMixer, type Mesh } from "three"
import { createVRMAnimationClip, VRMAnimation, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from '@pixiv/three-vrm-animation';

export const ThreeLayer = () => {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [mixer, setMixer] = useState<AnimationMixer | null>(null)
  const cubeRef = useRef<Mesh>(null)
  const blinkTimeRef = useRef<number>(0)
  const nextBlinkTimeRef = useRef<number>(2) // 次の瞬きまでの時間（秒）

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    loader.register((parser) => {
      return new VRMAnimationLoaderPlugin(parser);
    })
    loader.load(
      '/Zundamon_2025_VRM10A.vrm',
      (modelGltf) => {
        const vrm = modelGltf.userData.vrm as VRM
        console.info('VRM', vrm)

        VRMUtils.removeUnnecessaryVertices(vrm.scene);
				VRMUtils.removeUnnecessaryJoints(vrm.scene);

        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false
        });

        const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt!);
				lookAtQuatProxy.name = 'lookAtQuaternionProxy';
        vrm.scene.add(lookAtQuatProxy);

        setVrm(vrm)

        loader.load(
          '/idle_loop.vrma',
          (animationGltf) => {
            const vrmAnimation = animationGltf.userData.vrmAnimations[0] as VRMAnimation;
            const clip = createVRMAnimationClip(vrmAnimation, vrm);

            const mixer = new AnimationMixer(vrm.scene);
            mixer.clipAction(clip).play();
            setMixer(mixer)

            // const manupulator = new Manipulator(vrm.scene, [clip])
            // console.info(clip)
            // setManipulator(manupulator)
            // manupulator.play("Clip", true)
          },
        )
      },
    );
  }, [])

  useThree(({ camera }) => {
    camera.position.set(-0.05, 0.15, 0.4)
    camera.lookAt(-0.1, 0.15, 0)
    camera.updateProjectionMatrix()
  })

  const updateBlink = useCallback((delta: number, vrm: VRM) => {
    blinkTimeRef.current += delta

    // 次の瞬きの時間になったら
    if (blinkTimeRef.current >= nextBlinkTimeRef.current) {
      // 瞬きの時間をリセット
      blinkTimeRef.current = 0
      // 次の瞬きまでの時間をランダムに設定（2-6秒）
      nextBlinkTimeRef.current = 2 + Math.random() * 4
    }

    // 瞬きのアニメーション（0.2秒で完了）
    const blinkValue = blinkTimeRef.current < 0.2
      ? Math.sin(Math.PI * (blinkTimeRef.current / 0.2))
      : 0

    // 両目の瞬きを設定
    vrm.expressionManager?.setValue('blink', blinkValue)
    vrm.expressionManager?.update()
  }, [])

  useFrame((_state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.01
      cubeRef.current.rotation.y += 0.01
      cubeRef.current.rotation.z += 0.01
    }
    if(mixer && vrm) {
      mixer.update(delta)
      updateBlink(delta, vrm)
      vrm.update(delta)
    }
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
        intensity={0.5}
      />
      {vrm ? (
        <primitive
          object={vrm.scene}
          position={[0, -1, 0]}
        />
      ) : null}
    </>
  )
}
