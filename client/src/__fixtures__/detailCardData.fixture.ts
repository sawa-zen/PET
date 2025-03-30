import { DetailCardData } from '~/types'

export const createDetailCardData = (overrides: Partial<DetailCardData> = {}): DetailCardData => ({
  title: 'サンプルタイトル',
  description: 'サンプル説明',
  imageUrl: 'https://api.vrchat.cloud/api/1/image/file_d47cce28-cc9a-4850-be1b-8fcd1790e21f/1/256',
  ...overrides,
})
