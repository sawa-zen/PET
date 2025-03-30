import styles from './styles.module.css'

interface Props {
  className?: string
  title?: string
  children?: React.ReactNode
}

export const PreviewCard = ({
  className,
  title,
  children,
}: Props) => {
  return (
    <div className={`${className} ${styles.wrapper}`}>
      {title ? (
        <div className={styles.title}>
          {title}
        </div>
      ) : null}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
