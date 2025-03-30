import { useCallback, useEffect, useState } from 'react'
import type { DetailCardData, ListCardData, ServerShowDetailCardEvent, ServerShowListCardEvent } from '~/types'
import { socketClient } from '~/utils'
import { DetailCard } from './components/DetailCard'
import { ListCard } from './components/ListCard'
import styles from './styles.module.css'

interface Props {
  className?: string
}

export const PreviewContainer = ({ className }: Props) => {
  const [listCardData, setListCardData] = useState<ListCardData | null>(null)
  const [detailCardData, setDetailCardData] = useState<DetailCardData | null>(null)
  const showPreview = !!listCardData || !!detailCardData

  const handleShowListCard = useCallback((event: ServerShowListCardEvent) => {
    console.info('Show list card event:', event)
    setDetailCardData(null)
    setListCardData(event.payload)
  }, [])

  const handleShowDetailCard = useCallback((event: ServerShowDetailCardEvent) => {
    console.info('Show detail card event:', event)
    setListCardData(null)
    setDetailCardData(event.payload)
  }, [])

  const handleTimeout = useCallback(() => {
    console.info('Conversation timeout event')
    setListCardData(null)
    setDetailCardData(null)
  }, [])

  useEffect(() => {
    socketClient.on('s_show_list_card', handleShowListCard)
    socketClient.on('s_show_detail_card', handleShowDetailCard)
    socketClient.on('s_conversation_timeout', handleTimeout)
    return () => {
      socketClient.off('s_show_list_card', handleShowListCard)
      socketClient.off('s_show_detail_card', handleShowDetailCard)
      socketClient.off('s_conversation_timeout', handleTimeout)
    }
  }, [handleShowDetailCard, handleShowListCard, handleTimeout])

  return (
    <div
      className={`${className} ${styles.wrapper}`}
      style={showPreview ? {
        display: 'flex',
        flex: 1,
      } : {
        display: 'none',
        flex: 0,
      }}
    >
      {listCardData ? (
        <ListCard data={listCardData} />
      ) : null}
      {detailCardData ? (
        <DetailCard data={detailCardData} />
      ) : null}
    </div>
  )
}
