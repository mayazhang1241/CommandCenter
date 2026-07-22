import { useState, useEffect } from 'react'
import styles from './ClockWidget.module.css'

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className={styles.clock}>
      <div className={styles.time}>{timeStr}</div>
      <div className={styles.date}>{dateStr}</div>
    </div>
  )
}
