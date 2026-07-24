import { useEffect, useRef, useState, useCallback } from 'react'
import mqtt from 'mqtt'

// Allow fallback to the public broker during transition, but prefer Private Broker env vars
const BROKER = import.meta.env.VITE_MQTT_BROKER || 'wss://broker.hivemq.com:8884/mqtt'
const USERNAME = import.meta.env.VITE_MQTT_USERNAME || ''
const PASSWORD = import.meta.env.VITE_MQTT_PASSWORD || ''

const CLIENT_ID = 'REVO_DASH_' + Math.random().toString(16).slice(2, 8)

export default function useMqtt(kitId) {
  const clientRef = useRef(null)
  const [connected, setConnected]   = useState(false)
  const [sensors,   setSensors]     = useState({
    temperature: null,
    humidity:    null,
    moisture:    null,
    flowrate:    null,
    totalflow:   null,
  })
  const [relayState,  setRelayState]  = useState('OFF')
  const [mode,        setMode]        = useState('MANUAL')
  const [threshState, setThreshState] = useState('LOW:20,HIGH:60')
  const [timersJson,  setTimersJson]  = useState(null)
  const [currentTime, setCurrentTime] = useState(null)
  const [logs,        setLogs]        = useState([])
  const [alerts,      setAlerts]      = useState([])
  const [feedback,    setFeedback]    = useState(null)
  const [tempHistory, setTempHistory] = useState([])
  const [moistHistory,setMoistHistory]= useState([])

  useEffect(() => {
    // If no kit is selected, don't connect yet
    if (!kitId) return

    const base = kitId // dynamic topic base, e.g. "REVO-KIT-001"
    const TOPICS = [
      `${base}/sensor/temperature`,
      `${base}/sensor/humidity`,
      `${base}/sensor/moisture`,
      `${base}/sensor/flowrate`,
      `${base}/sensor/totalflow`,
      `${base}/relay/state`,
      `${base}/mode/state`,
      `${base}/time/current`,
      `${base}/threshold/state`,
      `${base}/timers/state`,
      `${base}/alert`,
      `${base}/log`,
      `${base}/feedback`,
    ]

    const options = {
      clientId: CLIENT_ID,
      clean: true,
      reconnectPeriod: 3000,
    }
    
    if (USERNAME && PASSWORD) {
      options.username = USERNAME
      options.password = PASSWORD
    }

    const client = mqtt.connect(BROKER, options)
    clientRef.current = client

    client.on('connect', () => {
      setConnected(true)
      TOPICS.forEach(t => client.subscribe(t))
    })

    client.on('disconnect', () => setConnected(false))
    client.on('error', ()    => setConnected(false))
    client.on('offline', ()  => setConnected(false))

    client.on('message', (topic, payload) => {
      const msg = payload.toString()
      const ts  = new Date().toLocaleTimeString()

      switch (topic) {
        case `${base}/sensor/temperature`:
          setSensors(s => ({ ...s, temperature: msg }))
          setTempHistory(h => [...h.slice(-29), { time: ts, value: parseFloat(msg) }])
          break
        case `${base}/sensor/humidity`:
          setSensors(s => ({ ...s, humidity: msg }))
          break
        case `${base}/sensor/moisture`:
          setSensors(s => ({ ...s, moisture: msg }))
          setMoistHistory(h => [...h.slice(-29), { time: ts, value: parseFloat(msg) }])
          break
        case `${base}/sensor/flowrate`:
          setSensors(s => ({ ...s, flowrate: msg }))
          break
        case `${base}/sensor/totalflow`:
          setSensors(s => ({ ...s, totalflow: msg }))
          break
        case `${base}/relay/state`:
          setRelayState(msg)
          break
        case `${base}/mode/state`:
          setMode(msg)
          break
        case `${base}/time/current`:
          setCurrentTime(msg)
          break
        case `${base}/threshold/state`:
          setThreshState(msg)
          break
        case `${base}/timers/state`:
          setTimersJson(msg)
          break
        case `${base}/log`:
          setLogs(l => [{ ts, msg }, ...l.slice(0, 99)])
          break
        case `${base}/alert`:
          setAlerts(a => [{ ts, msg }, ...a.slice(0, 49)])
          break
        case `${base}/feedback`:
          setFeedback({ ts, msg })
          break
      }
    })

    return () => {
      client.end()
    }
  }, [kitId]) // Reconnect if kitId changes

  const publish = useCallback((topic, payload) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish(topic, String(payload))
    }
  }, [])

  return {
    connected, sensors, relayState, mode,
    threshState, timersJson, currentTime,
    logs, alerts, feedback,
    tempHistory, moistHistory,
    publish,
  }
}
