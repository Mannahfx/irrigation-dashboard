import { useEffect, useRef, useState, useCallback } from 'react'
import mqtt from 'mqtt'

const BROKER   = 'wss://broker.hivemq.com:8884/mqtt'
const CLIENT_ID = 'MANNA_DASH_' + Math.random().toString(16).slice(2, 8)

const TOPICS = [
  'manna/sensor/temperature',
  'manna/sensor/humidity',
  'manna/sensor/moisture',
  'manna/sensor/flowrate',
  'manna/sensor/totalflow',
  'manna/relay/state',
  'manna/mode/state',
  'manna/time/current',
  'manna/threshold/state',
  'manna/timers/state',
  'manna/alert',
  'manna/log',
  'manna/feedback',
]

export default function useMqtt() {
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
    const client = mqtt.connect(BROKER, {
      clientId: CLIENT_ID,
      clean: true,
      reconnectPeriod: 3000,
    })

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
        case 'manna/sensor/temperature':
          setSensors(s => ({ ...s, temperature: msg }))
          setTempHistory(h => [...h.slice(-29), { time: ts, value: parseFloat(msg) }])
          break
        case 'manna/sensor/humidity':
          setSensors(s => ({ ...s, humidity: msg }))
          break
        case 'manna/sensor/moisture':
          setSensors(s => ({ ...s, moisture: msg }))
          setMoistHistory(h => [...h.slice(-29), { time: ts, value: parseFloat(msg) }])
          break
        case 'manna/sensor/flowrate':
          setSensors(s => ({ ...s, flowrate: msg }))
          break
        case 'manna/sensor/totalflow':
          setSensors(s => ({ ...s, totalflow: msg }))
          break
        case 'manna/relay/state':
          setRelayState(msg)
          break
        case 'manna/mode/state':
          setMode(msg)
          break
        case 'manna/time/current':
          setCurrentTime(msg)
          break
        case 'manna/threshold/state':
          setThreshState(msg)
          break
        case 'manna/timers/state':
          setTimersJson(msg)
          break
        case 'manna/log':
          setLogs(l => [{ ts, msg }, ...l.slice(0, 99)])
          break
        case 'manna/alert':
          setAlerts(a => [{ ts, msg }, ...a.slice(0, 49)])
          break
        case 'manna/feedback':
          setFeedback({ ts, msg })
          break
      }
    })

    return () => client.end()
  }, [])

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
