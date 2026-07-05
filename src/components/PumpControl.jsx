import styles from './PumpControl.module.css'

const MODES = ['MANUAL', 'AUTO', 'TIMER']

export default function PumpControl({ relayState, mode, publish, connected }) {
  const isManual = mode === 'MANUAL'

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
              onClick={() => publish('manna/mode/command', m)}
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
              onClick={() => publish('manna/relay/command', 'ON')}
              disabled={!connected || relayState === 'ON'}
            >
              ▶ Turn ON
            </button>
            <button
              className={`${styles.pumpBtn} ${styles.btnOff}`}
              onClick={() => publish('manna/relay/command', 'OFF')}
              disabled={!connected || relayState === 'OFF'}
            >
              ⏹ Turn OFF
            </button>
            <button
              className={`${styles.pumpBtn} ${styles.btnToggle}`}
              onClick={() => publish('manna/relay/command', 'TOGGLE')}
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
          onClick={() => publish('manna/flowreset', '1')}
          disabled={!connected}
        >
          Reset Flow Counter
        </button>
      </div>
    </div>
  )
}
