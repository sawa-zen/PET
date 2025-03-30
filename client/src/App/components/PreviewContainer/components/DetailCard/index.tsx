import { PreviewCard } from '~/components/PreviewCard'
import { DetailCardData } from '~/types'

interface Props {
  data: DetailCardData
}

export const DetailCard = ({ data }: Props) => {
  return (
    <PreviewCard title={data.title}>
      {data.imageUrl ? (
        <div>
          <img
            src={data.imageUrl}
            alt="Detail"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
        </div>
      ) : null}
      <div>
        {data.description}
      </div>
    </PreviewCard>
  )
}
