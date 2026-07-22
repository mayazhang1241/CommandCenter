import styles from './Widget.module.css'

export default function Widget({ title, icon, children, action, className = '' }) {
  return (
    <div className={`${styles.widget} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
