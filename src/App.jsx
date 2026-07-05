import { useState } from 'react'
import useMqtt from './hooks/useMqtt'
import SensorCards from './components/SensorCards'
import PumpControl from './components/PumpControl'
import ThresholdControl from './components/ThresholdControl'
import TimerSlots from './components/TimerSlots'
import RtcSetter from './components/RtcSetter'
import EventLog from './components/EventLog'
import AlertBanner from './components/AlertBanner'
import SensorChart from './components/SensorChart'
import styles from './App.module.css'

const TABS = ['Monitor', 'Control', 'Timers', 'Log']

export default function App() {
  const mqtt = useMqtt()
  const [tab, setTab] = useState('Monitor')

  return (
    <div className={styles.shell}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>M</div>
          <div>
            <div className={styles.brandName}>REVOSMART</div>
            <div className={styles.brandSub}>Smart Irrigation Dashboard</div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {mqtt.currentTime && (
            <div className={styles.rtcTime}>{mqtt.currentTime}</div>
          )}
          <div className={`${styles.badge} ${mqtt.connected ? styles.online : styles.offline}`}>
            <span className={styles.dot} />
            {mqtt.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      {/* ALERT BANNER */}
      {mqtt.alerts.length > 0 && (
        <AlertBanner alerts={mqtt.alerts} />
      )}

      {/* FEEDBACK BAR */}
      {mqtt.feedback && (
        <div className={styles.feedbackBar}>
          <span className={styles.feedbackIcon}>↩</span>
          <span className={styles.feedbackText}>{mqtt.feedback.msg}</span>
          <span className={styles.feedbackTime}>{mqtt.feedback.ts}</span>
        </div>
      )}

      {/* TABS */}
      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={styles.main}>

        {tab === 'Monitor' && (
          <div className={styles.monitorGrid}>
            <SensorCards sensors={mqtt.sensors} relayState={mqtt.relayState} mode={mqtt.mode} />
            <SensorChart tempHistory={mqtt.tempHistory} moistHistory={mqtt.moistHistory} />
          </div>
        )}

        {tab === 'Control' && (
          <div className={styles.controlGrid}>
            <PumpControl
              relayState={mqtt.relayState}
              mode={mqtt.mode}
              publish={mqtt.publish}
              connected={mqtt.connected}
            />
            <ThresholdControl
              threshState={mqtt.threshState}
              publish={mqtt.publish}
              connected={mqtt.connected}
            />
            <RtcSetter publish={mqtt.publish} connected={mqtt.connected} />
          </div>
        )}

        {tab === 'Timers' && (
          <TimerSlots
            timersJson={mqtt.timersJson}
            publish={mqtt.publish}
            connected={mqtt.connected}
          />
        )}

        {tab === 'Log' && (
          <EventLog logs={mqtt.logs} />
        )}

      </main>

      <footer className={styles.footer}>
        © 2026 REVOSMART Integrated Services
      </footer>
    </div>
  )
}
