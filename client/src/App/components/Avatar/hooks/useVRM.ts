import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { type VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { createVRMAnimationClip, type VRMAnimation, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from '@pixiv/three-vrm-animation'
import { useFrame } from '@react-three/fiber'
import { AnimationAction, AnimationMixer, Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { AvatarMotion } from '~/types'

interface Props {
  avatarMotion: AvatarMotion
}

export const useVRM = ({ avatarMotion }: Props) => {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [mixer, setMixer] = useState<AnimationMixer | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<AvatarMotion>('idle')
  const [animations, setAnimations] = useState<{
    idleAction: AnimationAction | null
    searchAction: AnimationAction | null
    thinkingAction: AnimationAction | null
  }>({ idleAction: null, searchAction: null, thinkingAction: null })

  useAsync(async () => {
    const loader = new GLTFLoader()
    loader.register(parser => new VRMLoaderPlugin(parser))
    loader.register(parser => new VRMAnimationLoaderPlugin(parser))
    const modelGltf = await loader.loadAsync('/Zundamon_2025_VRM10A.vrm')
    const vrm = modelGltf.userData.vrm as VRM

    VRMUtils.removeUnnecessaryVertices(vrm.scene)
    VRMUtils.removeUnnecessaryJoints(vrm.scene)

    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false
    })

    const lookAtTarget = new Object3D()
    lookAtTarget.position.set(0, 1.2, 0.7)
    vrm.lookAt!.target = lookAtTarget

    const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt!)
    lookAtQuatProxy.name = 'lookAtQuaternionProxy'
    vrm.scene.add(lookAtQuatProxy)

    setVrm(vrm)

    const [idleGltf, searchGltf, thinkingGltf] = await Promise.all([
      loader.loadAsync('/idle.vrma'),
      loader.loadAsync('/search.vrma'),
      loader.loadAsync('/thinking.vrma'),
    ])

    const idleAnimation = idleGltf.userData.vrmAnimations[0] as VRMAnimation
    const searchAnimation = searchGltf.userData.vrmAnimations[0] as VRMAnimation
    const thinkingAnimation = thinkingGltf.userData.vrmAnimations[0] as VRMAnimation

    const idleClip = createVRMAnimationClip(idleAnimation, vrm)
    const searchClip = createVRMAnimationClip(searchAnimation, vrm)
    const thinkingClip = createVRMAnimationClip(thinkingAnimation, vrm)

    const mixer = new AnimationMixer(vrm.scene)
    const idleAction = mixer.clipAction(idleClip)
    const searchAction = mixer.clipAction(searchClip)
    const thinkingAction = mixer.clipAction(thinkingClip)

    idleAction.play()
    setMixer(mixer)
    setAnimations({ idleAction, searchAction, thinkingAction })
  }, [])

  useEffect(() => {
    if (!animations.idleAction || !animations.searchAction || !animations.thinkingAction) return

    const { idleAction, searchAction, thinkingAction } = animations
    const currentAction = currentAnimation === 'idle' ? idleAction :
      currentAnimation === 'search' ? searchAction : thinkingAction

    // 現在のアニメーションと異なる場合のみ切り替え
    if (avatarMotion !== currentAnimation) {
      currentAction.fadeOut(0.2)
      const nextAction = avatarMotion === 'idle' ? idleAction :
        avatarMotion === 'search' ? searchAction : thinkingAction
      nextAction.reset().fadeIn(0.5).play()
      setCurrentAnimation(avatarMotion)
    }
  }, [animations, avatarMotion, currentAnimation])

  useFrame((_state, delta) => {
    if(!mixer || !vrm) return
    mixer.update(delta)

    // アニメーションに応じて視線を調整
    if (vrm.lookAt?.target) {
      if (currentAnimation === 'search') {
        vrm.lookAt.target.position.set(-0.1, 0.8, 0.5)
      } else if (currentAnimation === 'thinking') {
        vrm.lookAt.target.position.set(0, 0.8, 0.5)
      } else {
        vrm.lookAt.target.position.set(0, 1.2, 0.7)
      }
    }

    vrm.update(delta)
  })

  return {
    vrm,
  }
}
