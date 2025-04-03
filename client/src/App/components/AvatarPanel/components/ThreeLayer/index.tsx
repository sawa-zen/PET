import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { Stats } from '@react-three/drei'

import type { Mesh } from "three"

export const ThreeLayer = () => {
  const [gltf, setGltf] = useState<GLTF | null>(null)
  const cubeRef = useRef<Mesh>(null)

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    loader.load(
      // URL of the VRM you want to load
      '/sample.vrm',
      // called when the resource is loaded
      (gltf) => {
        setGltf(gltf)
      },
      // called while loading is progressing
      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      // called when loading has errors
      (error) => console.error(error),
    );
  }, [])

  useThree(({ camera }) => {
    camera.position.set(0, 0.25, 0.8)
    camera.lookAt(0, 0.25, 0)
    camera.updateProjectionMatrix()
  })

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.01
      cubeRef.current.rotation.y += 0.01
      cubeRef.current.rotation.z += 0.01
    }
  })

  return (
    <>
      <Stats />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      {gltf ? (
        <primitive
          object={gltf.scene}
          position={[0, -1, 0]}
          dispose={null}
        />
      ) : null}
    </>
  )
}