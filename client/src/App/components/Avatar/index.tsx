import { memo } from 'react'
import { useThree } from '@react-three/fiber'
import { AvatarMotion } from '~/types'
import { useBlink } from './hooks/useBlink'
import { useLipSync } from './hooks/useLipSync'
import { useVRM } from './hooks/useVRM'

interface Props {
  speaking: boolean
  avatarMotion: AvatarMotion
}

export const Avatar = memo(({ speaking, avatarMotion }: Props) => {
  const { vrm } = useVRM({ avatarMotion })
  useBlink({ vrm })
  useLipSync({ vrm, speaking })

  useThree(({ camera }) => {
    camera.position.set(0, 1.30, 0.6)
    camera.lookAt(0, 1.15, 0)
    camera.updateProjectionMatrix()
  })

  return vrm ? (
    <primitive
      object={vrm.scene}
      position={[-0.05, 0, 0]}
    />
  ) : null
})
Avatar.displayName = 'Avatar'
