import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Thermometer, Droplets, Wind, Zap, Activity, Send, ToggleLeft, ToggleRight, Terminal, Bot } from 'lucide-react'

import API, { headers } from '../config'

const DEVICES = [
  { key: 'led',    label: 'LED',       icon: Zap,      color: '#e67700', bg: '#fffbeb', border: '#fde68a', bar: 'brightness' },
  { key: 'fan',    label: 'Fan',       icon: Wind,     color: '#3b5bdb', bg: '#eef1fd', border: '#c5d0fa', bar: 'speed'      },
  { key: 'motor',  label: 'Motor',     icon: Activity, color: '#0ca678', bg: '#e6f7f3', border: '#6ee7b7', bar: 'speed'      },
  { key: 'buzzer', label: 'Buzzer',    icon: Zap,      color: '#e03131', bg: '#fff0f0', border: '#fca5a5', bar: null         },
]

const QUICK = [
  { label: '💡 LED On',   device: 'led',    action: 'on'  },
  { label: '💡 LED Off',  device: 'led',    action: 'off' },
  { label: '🌀 Fan On',   device: 'fan',    action: 'on'  },
  { label: '🌀 Fan Off',  device: 'fan',    action: 'off' },
  { label: '⚙️ Motor On', device: 'motor',  action: 'on'  },
  { label: '🔔 Buzz',     device: 'buzzer', action: 'on'  },
]

export default function HardwarePanel({ onAppOpen }) {
  const [hw, setHw]             = useState(null)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hardware AI ready. Try: "turn on LED", "set fan to 80%", "read temperature"' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    const poll = setInterval(fetchStatus, 2000)
    fetchStatus()
    return () => clearInterval(poll)
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const fetchStatus = async () => {
    try { const { data } = await axios.get(`${API}/hardware/status`, { headers }); setHw(data.hardware) } catch {}
  }

  const quickAction = async (device, action) => {
    try { await axios.post(`${API}/hardware/${device}/${action}`); fetchStatus() } catch {}
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const msg = input.trim(); setInput(''); setLoading(true)
    setMessages(m => [...m, { role: 'user', text: msg }])
    const lower = msg.toLowerCase()
    if (lower.includes('camera'))  { onAppOpen('camera');  setLoading(false); setMessages(m => [...m, { role: 'ai', text: '📷 Opening Camera...' }]); return }
    if (lower.includes('weather')) { onAppOpen('weather'); setLoading(false); setMessages(m => [...m, { role: 'ai', text: '🌤️ Opening Weather...' }]); return }
    if (lower.includes('music'))   { onAppOpen('music');   setLoading(false); setMessages(m => [...m, { role: 'ai', text: '🎵 Opening Music...' }]); return }
    if (lower.includes('photo'))   { onAppOpen('photos');  setLoading(false); setMessages(m => [...m, { role: 'ai', text: '🖼️ Opening Photos...' }]); return }
    try {
      const { data } = await axios.post(`${API}/chat`, { message: msg }, { headers })
      setMessages(m => [...m, { role: 'ai', text: data.response.replace(/ACTION:.*$/ms, '').trim() }])
      fetchStatus()
    } catch {
      setMessages(m => [...m, { role: 'ai', text: '⚠️ Backend offline. Run: uvicorn main:app --reload' }])
    }
    setLoading(false)
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* ── Left column ── */}
      <div className="space-y-4">

        {/* Device cards */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#9ba3c0' }}>Device Control</p>
          <div className="grid grid-cols-2 gap-3">
            {DEVICES.map(({ key, label, icon: Icon, color, bg, border, bar }) => {
              const state = hw?.[key]
              const isOn  = state?.status === 'on'
              const val   = bar ? (state?.[bar] ?? 0) : 0
              return (
                <div key={key} className="card shadow-card p-4 transition-all duration-300"
                  style={isOn ? { background: bg, borderColor: border } : {}}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: isOn ? `${color}18` : '#f5f6fa', border: `1px solid ${isOn ? `${color}33` : '#e4e7f0'}` }}>
                        <Icon size={15} style={{ color: isOn ? color : '#c0c8e0' }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: isOn ? '#1a1a2e' : '#9ba3c0' }}>{label}</div>
                        <div className="text-[10px]" style={{ color: isOn ? color : '#c0c8e0' }}>{isOn ? 'ON' : 'OFF'}</div>
                      </div>
                    </div>
                    <button onClick={() => quickAction(key, isOn ? 'off' : 'on')} style={{ color: isOn ? color : '#d0d5e8' }}>
                      {isOn ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                  {bar && (
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px]" style={{ color: '#9ba3c0' }}>{bar}</span>
                        <span className="text-[10px] font-semibold mono" style={{ color: isOn ? color : '#c0c8e0' }}>{val}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e4e7f0' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val}%`, background: isOn ? `linear-gradient(90deg,${color}88,${color})` : '#d0d5e8' }} />
                      </div>
                    </div>
                  )}
                  {!bar && (
                    <div className="h-2 rounded-full" style={{ background: isOn ? `${color}22` : '#f0f2f8', border: `1px solid ${isOn ? `${color}33` : '#e4e7f0'}` }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: isOn ? '100%' : '0%', background: color }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sensors */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#9ba3c0' }}>Live Sensors</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="card shadow-card p-5" style={{ background: 'linear-gradient(135deg,#fff7ed,#fff)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <Thermometer size={15} style={{ color: '#f76707' }} />
                </div>
                <span className="text-xs" style={{ color: '#9ba3c0' }}>Temperature</span>
              </div>
              <div className="text-4xl font-bold mono" style={{ color: '#f76707' }}>
                {hw?.temperature_sensor?.value ?? '--'}
                <span className="text-lg font-normal ml-1" style={{ color: '#fbd38d' }}>°C</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#fed7aa' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(((hw?.temperature_sensor?.value ?? 0) / 50) * 100, 100)}%`, background: '#f76707' }} />
              </div>
            </div>
            <div className="card shadow-card p-5" style={{ background: 'linear-gradient(135deg,#ecfeff,#fff)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}>
                  <Droplets size={15} style={{ color: '#0891b2' }} />
                </div>
                <span className="text-xs" style={{ color: '#9ba3c0' }}>Humidity</span>
              </div>
              <div className="text-4xl font-bold mono" style={{ color: '#0891b2' }}>
                {hw?.humidity_sensor?.value ?? '--'}
                <span className="text-lg font-normal ml-1" style={{ color: '#67e8f9' }}>%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#a5f3fc' }}>
                <div className="h-full rounded-full" style={{ width: `${hw?.humidity_sensor?.value ?? 0}%`, background: '#0891b2' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column — AI Terminal ── */}
      <div className="card shadow-card flex flex-col overflow-hidden" style={{ minHeight: '520px' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #e4e7f0', background: 'linear-gradient(135deg,#eef1fd,#fff)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#3b5bdb' }}>
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>AI Terminal</div>
            <div className="text-[10px]" style={{ color: '#9ba3c0' }}>Powered by Ollama · Offline</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#e6f7f3', border: '1px solid #6ee7b7' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0ca678' }} />
            <span className="text-[10px] font-medium" style={{ color: '#0ca678' }}>Ready</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderBottom: '1px solid #f0f2f8', background: '#fafbff' }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => quickAction(q.device, q.action)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{ background: '#fff', border: '1px solid #e4e7f0', color: '#5a6080' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eef1fd'; e.currentTarget.style.borderColor = '#c5d0fa'; e.currentTarget.style.color = '#3b5bdb' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e4e7f0'; e.currentTarget.style.color = '#5a6080' }}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#fafbff' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                    style={{ background: '#3b5bdb' }}>
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm"
                    style={{ background: '#fff', border: '1px solid #e4e7f0', color: '#1a1a2e' }}>
                    {m.text}
                  </div>
                </>
              )}
              {m.role === 'user' && (
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-xs leading-relaxed"
                  style={{ background: '#3b5bdb', color: '#fff' }}>
                  {m.text}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: '#3b5bdb' }}>
                <Bot size={13} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm" style={{ background: '#fff', border: '1px solid #e4e7f0' }}>
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#3b5bdb', animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 flex gap-3" style={{ borderTop: '1px solid #e4e7f0', background: '#fff' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder='Ask AI or type a command...'
            className="flex-1 text-sm px-4 py-2.5 rounded-xl outline-none transition-all"
            style={{ background: '#f5f6fa', border: '1px solid #e4e7f0', color: '#1a1a2e' }}
            onFocus={e => { e.target.style.borderColor = '#3b5bdb66'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e4e7f0'; e.target.style.background = '#f5f6fa' }} />
          <button onClick={sendMessage} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            style={{ background: '#3b5bdb', color: '#fff', boxShadow: '0 2px 8px #3b5bdb33' }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
