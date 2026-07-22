import { Calendar } from 'lucide-react'
import Widget from '../Widget'
import styles from './PlaceholderWidget.module.css'

export default function CalendarWidget() {
  return (
    <Widget title="Calendar" icon={<Calendar size={14} />}>
      <div className={styles.soon}>
        <Calendar size={28} className={styles.soonIcon} />
        <p className={styles.soonText}>Google Calendar coming soon</p>
      </div>
    </Widget>
  )
}
