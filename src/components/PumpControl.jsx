import { logActivity } from '../lib/activityLogger'
import styles from './PumpControl.module.css'

const MODES = ['MANUAL', 'AUTO', 'TIMER']

export default function PumpControl({ relayState, mode, publish, connected, user, profile }) {
  const isManual = mode === 'MANUAL'

  function changeMode(m) {
    publish('manna/mode/command', m)
    if (user) {
      logActivity(user.id, user.email, 'MODE_CHANGE', `Mode changed to ${m}`, profile?.device_id)
    }
  }

  function controlPump(cmd) {
    publish('manna/relay/command', cmd)
    if (user) {
      const action = cmd === 'ON' ? 'PUMP_ON' : cmd === 'OFF' ? 'PUMP_OFF' : 'PUMP_TOGGLE'
      logActivity(user.id, user.email, action, `Pump ${cmd}`, profile?.device_id)
    }
  }

  function resetFlow() {
    publish('manna/flowreset', '1')
    if (user) {
      logActivity(user.id, user.email, 'FLOW_RESET', 'Flow counter reset', profile?.device_id)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.title}>Pump & Mode Control</div>

      {/* MODE SELECTOR */}
      <div className={styles.section}>
        <div className={styles.label}>Operating Mode</div>
        <div className={styles.modeRow}>
          {MODES.map(m => (
            <button
              key={m}
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => changeMode(m)}
              disabled={!connected}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* PUMP STATE */}
      <div className={styles.section}>
        <div className={styles.label}>Water Pump</div>
        <div className={styles.pumpRow}>
          <div className={`${styles.pumpIndicator} ${relayState === 'ON' ? styles.pumpOn : styles.pumpOff}`}>
            <span className={styles.pumpDot} />
            {relayState}
          </div>
          {!isManual && (
            <div className={styles.autoNote}>
              Pump controlled by {mode} mode
            </div>
          )}
        </div>

        {isManual && (
          <div className={styles.btnRow}>
            <button
              className={`${styles.pumpBtn} ${styles.btnOn}`}
              onClick={() => controlPump('ON')}
              disabled={!connected || relayState === 'ON'}
            >
              ▶ Turn ON
            </button>
            <button
              className={`${styles.pumpBtn} ${styles.btnOff}`}
              onClick={() => controlPump('OFF')}
              disabled={!connected || relayState === 'OFF'}
            >
              ⏹ Turn OFF
            </button>
            <button
              className={`${styles.pumpBtn} ${styles.btnToggle}`}
              onClick={() => controlPump('TOGGLE')}
              disabled={!connected}
            >
              ⇄ Toggle
            </button>
          </div>
        )}
      </div>

      {/* FLOW RESET */}
      <div className={styles.section}>
        <button
          className={styles.resetBtn}
          onClick={resetFlow}
          disabled={!connected}
        >
          Reset Flow Counter
        </button>
      </div>
    </div>
  )
}
