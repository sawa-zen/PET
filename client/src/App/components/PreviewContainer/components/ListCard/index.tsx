import { PreviewCard } from '~/components/PreviewCard'
import { ListCardData } from '~/types'
import styles from './styles.module.css'

interface Props {
  data: ListCardData
}

export const ListCard = ({ data }: Props) => {
  const items = data.items || []

  return (
    <PreviewCard title={data.title}>
      {items.map((item, index) => (
        <div key={index} className={styles.itemCard}>
          {item.imageUrl ? (
            <div className={styles.thumbnailWrapper}>
              <img
                className={styles.thumbnail}
                src={item.imageUrl}
              />
            </div>
          ) : null}
          <div className={styles.itemContent}>
            <div className={styles.itemTitle}>
              {item.title}
            </div>
            {item.description ? (
              <div>
                {item.description}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </PreviewCard>
  )
}
