import { useState } from 'react'
import { logActivity } from '../lib/activityLogger'
import styles from './ThresholdControl.module.css'

export default function ThresholdControl({ threshState, publish, connected, user, profile }) {
  const [low,  setLow]  = useState('20')
  const [high, setHigh] = useState('60')
  const [err,  setErr]  = useState('')

  function apply() {
    const lo = parseInt(low)
    const hi = parseInt(high)
    if (isNaN(lo) || isNaN(hi)) { setErr('Enter valid numbers'); return }
    if (lo < 1 || lo > 94)      { setErr('Low must be 1–94');    return }
    if (hi < 2 || hi > 95)      { setErr('High must be 2–95');   return }
    if (lo >= hi)                { setErr('Low must be less than High'); return }
    setErr('')
    publish('manna/threshold/low',  String(lo))
    publish('manna/threshold/high', String(hi))
    if (user) {
      logActivity(user.id, user.email, 'THRESHOLD_SET', `Thresholds set: LOW=${lo}%, HIGH=${hi}%`, profile?.device_id)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.title}>Moisture Thresholds</div>

      <div className={styles.current}>
        Current: <span className={styles.currentVal}>{threshState}</span>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} style={{ color: 'var(--red)' }}>
            Pump ON at or below
          </label>
          <div className={styles.inputWrap}>
            <input
              type="number" min="1" max="94"
              value={low}
              onChange={e => setLow(e.target.value)}
              className={styles.input}
              style={{ borderColor: 'var(--red)44' }}
            />
            <span className={styles.unit}>%</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} style={{ color: 'var(--green)' }}>
            Pump OFF at or above
          </label>
          <div className={styles.inputWrap}>
            <input
              type="number" min="2" max="95"
              value={high}
              onChange={e => setHigh(e.target.value)}
              className={styles.input}
              style={{ borderColor: 'var(--green)44' }}
            />
            <span className={styles.unit}>%</span>
          </div>
        </div>
      </div>

      {err && <div className={styles.err}>{err}</div>}

      <div className={styles.holdZone}>
        Hold zone (no switching): {low}% – {high}%
      </div>

      <button
        className={styles.applyBtn}
        onClick={apply}
        disabled={!connected}
      >
        ✓ Apply Thresholds
      </button>
    </div>
  )
}
