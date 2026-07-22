import { useState, useEffect } from 'react'
import styles from './App.module.css'
import ClockWidget from './components/ClockWidget'
import CalendarWidget from './components/widgets/CalendarWidget'
import GmailWidget from './components/widgets/GmailWidget'
import WeatherWidget from './components/widgets/WeatherWidget'
import OutlookWidget from './components/widgets/OutlookWidget'
import QuickLaunchWidget from './components/widgets/QuickLaunchWidget'

export default function App() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span className={styles.logoText}>Command Center</span>
          </div>
          <p className={styles.greeting}>{greeting}, Maya</p>
        </div>
        <ClockWidget />
      </header>

      <main className={styles.grid}>
        <div className={styles.colSpan2}>
          <CalendarWidget />
        </div>
        <WeatherWidget />

        <GmailWidget />
        <OutlookWidget />
        <QuickLaunchWidget />
      </main>
    </div>
  )
}
