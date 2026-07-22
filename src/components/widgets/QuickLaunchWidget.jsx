import { LayoutGrid } from 'lucide-react'
import Widget from '../Widget'
import styles from './PlaceholderWidget.module.css'

export default function QuickLaunchWidget() {
  return (
    <Widget title="Quick Launch" icon={<LayoutGrid size={14} />}>
      <div className={styles.soon}>
        <LayoutGrid size={28} className={styles.soonIcon} />
        <p className={styles.soonText}>Quick launch coming soon</p>
      </div>
    </Widget>
  )
}
