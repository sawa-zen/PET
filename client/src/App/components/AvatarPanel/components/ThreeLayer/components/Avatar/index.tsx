import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"
import { createVRMAnimationClip, VRMAnimation, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from "@pixiv/three-vrm-animation"
import { useFrame } from "@react-three/fiber"
import { useState } from "react"
import { AnimationMixer } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { useBlink } from "./hooks/useBlink"
import { useAsync } from "react-use"

export const Avatar = () => {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [mixer, setMixer] = useState<AnimationMixer | null>(null)

  useBlink({ vrm })

  useAsync(async () => {
    const loader = new GLTFLoader();
    loader.register(parser => new VRMLoaderPlugin(parser));
    loader.register(parser => new VRMAnimationLoaderPlugin(parser));
    const modelGltf = await loader.loadAsync('/Zundamon_2025_VRM10A.vrm');
    const vrm = modelGltf.userData.vrm as VRM

    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.removeUnnecessaryJoints(vrm.scene);

    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false
    });

    const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt!);
    lookAtQuatProxy.name = 'lookAtQuaternionProxy';
    vrm.scene.add(lookAtQuatProxy);

    setVrm(vrm)

    const animationGltf = await loader.loadAsync('/idle_loop.vrma');
    const vrmAnimation = animationGltf.userData.vrmAnimations[0] as VRMAnimation;
    const clip = createVRMAnimationClip(vrmAnimation, vrm);
    const mixer = new AnimationMixer(vrm.scene);
    mixer.clipAction(clip).play();
    setMixer(mixer)
  })

  useFrame((_state, delta) => {
    if(mixer && vrm) {
      mixer.update(delta)
      vrm.update(delta)
    }
  })

  return vrm ? (
    <primitive
      object={vrm.scene}
      position={[0, -1, 0]}
    />
  ) : null
}