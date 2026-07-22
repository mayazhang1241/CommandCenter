import { Mail } from 'lucide-react'
import Widget from '../Widget'
import styles from './PlaceholderWidget.module.css'

export default function OutlookWidget() {
  return (
    <Widget title="Outlook" icon={<Mail size={14} />}>
      <div className={styles.soon}>
        <Mail size={28} className={styles.soonIcon} />
        <p className={styles.soonText}>School Outlook coming soon</p>
      </div>
    </Widget>
  )
}
