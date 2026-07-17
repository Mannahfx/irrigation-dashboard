import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import useMqtt from '../hooks/useMqtt'
import SensorCards from '../components/SensorCards'
import PumpControl from '../components/PumpControl'
import ThresholdControl from '../components/ThresholdControl'
import TimerSlots from '../components/TimerSlots'
import RtcSetter from '../components/RtcSetter'
import EventLog from '../components/EventLog'
import AlertBanner from '../components/AlertBanner'
import SensorChart from '../components/SensorChart'
import styles from './DashboardPage.module.css'

const TABS = ['Monitor', 'Control', 'Timers', 'Log']

export default function DashboardPage() {
  const mqtt = useMqtt()
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('Monitor')

  return (
    <>
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
              user={user}
              profile={profile}
            />
            <ThresholdControl
              threshState={mqtt.threshState}
              publish={mqtt.publish}
              connected={mqtt.connected}
              user={user}
              profile={profile}
            />
            <RtcSetter
              publish={mqtt.publish}
              connected={mqtt.connected}
              user={user}
              profile={profile}
            />
          </div>
        )}

        {tab === 'Timers' && (
          <TimerSlots
            timersJson={mqtt.timersJson}
            publish={mqtt.publish}
            connected={mqtt.connected}
            user={user}
            profile={profile}
          />
        )}

        {tab === 'Log' && (
          <EventLog logs={mqtt.logs} />
        )}
      </main>
    </>
  )
}
