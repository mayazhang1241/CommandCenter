import { Cloud } from 'lucide-react'
import Widget from '../Widget'
import styles from './PlaceholderWidget.module.css'

export default function WeatherWidget() {
  return (
    <Widget title="Weather" icon={<Cloud size={14} />}>
      <div className={styles.soon}>
        <Cloud size={28} className={styles.soonIcon} />
        <p className={styles.soonText}>Weather widget coming soon</p>
      </div>
    </Widget>
  )
}
