import { useState, useEffect } from 'react'
import axios from 'axios'
import { Wind, Droplets, RefreshCw, Thermometer, Eye, Gauge } from 'lucide-react'

import API from '../config'
const CITIES = ['karachi', 'lahore', 'islamabad']
const ICONS = {
  'Sunny': '☀️', 'Hot & Hazy': '🌫️', 'Partly Cloudy': '⛅',
  'Clear': '🌙', 'Cloudy': '☁️', 'Windy': '💨', 'Rainy': '🌧️',
  'Light Rain': '🌦️', 'Thunderstorm': '⛈️', 'Heavy thunderstorm': '⛈️'
}

const BG = {
  'Sunny': 'linear-gradient(135deg,#fff7ed,#fef3c7,#fff)',
  'Hot & Hazy': 'linear-gradient(135deg,#fef3c7,#fde68a,#fff)',
  'Partly Cloudy': 'linear-gradient(135deg,#eff6ff,#dbeafe,#fff)',
  'Light Rain': 'linear-gradient(135deg,#ecfeff,#cffafe,#eff6ff,#fff)',
  'Thunderstorm': 'linear-gradient(135deg,#f5f3ff,#ede9fe,#fff)',
  'Clear': 'linear-gradient(135deg,#eff6ff,#dbeafe,#fff)',
  'Cloudy': 'linear-gradient(135deg,#f8fafc,#f1f5f9,#fff)',
  'Windy': 'linear-gradient(135deg,#f0fdf4,#dcfce7,#fff)',
}

export default function WeatherApp() {
  const [weather, setWeather] = useState(null)
  const [city, setCity]       = useState('karachi')
  const [loading, setLoading] = useState(false)

  const load = async (c = city) => {
    setLoading(true)
    try { const { data } = await axios.get(`${API}/weather?city=${c}`); setWeather(data) } catch {}
    setLoading(false)
  }

  useEffect(() => { load(city) }, [city])

  const bg = BG[weather?.condition] || 'linear-gradient(135deg,#f5f6fa,#fff)'

  return (
    <div className="w-full space-y-4">

      {/* City selector */}
      <div className="flex items-center gap-3">
        <div className="card shadow-card p-1 flex gap-1">
          {CITIES.map(c => (
            <button key={c} onClick={() => setCity(c)}
              className="px-5 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={city === c
                ? { background: '#0891b2', color: '#fff', boxShadow: '0 2px 8px #0891b244' }
                : { color: '#9ba3c0' }}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => load(city)}
          className="w-8 h-8 rounded-xl flex items-center justify-center card shadow-card transition-all"
          style={{ color: loading ? '#0891b2' : '#c0c8e0' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {weather && (
        <>
          {/* Main hero card — full width, 2 column */}
          <div className="card shadow-card overflow-hidden" style={{ background: bg }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

              {/* Left — current weather */}
              <div className="p-8 flex flex-col justify-between" style={{ borderRight: '1px solid #e4e7f022' }}>
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{weather.city}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#0891b215', color: '#0891b2' }}>
                      Updated {weather.updated}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-8xl">{ICONS[weather.condition] || '🌡️'}</span>
                    <div>
                      <div className="text-7xl font-bold mono leading-none" style={{ color: '#1a1a2e' }}>
                        {weather.temperature}°
                      </div>
                      <div className="text-base font-semibold mt-1" style={{ color: '#0891b2' }}>
                        {weather.condition}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #e4e7f0' }}>
                    <Droplets size={16} className="mx-auto mb-1" style={{ color: '#0891b2' }} />
                    <div className="text-base font-bold mono" style={{ color: '#1a1a2e' }}>{weather.humidity}%</div>
                    <div className="text-[10px]" style={{ color: '#9ba3c0' }}>Humidity</div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #e4e7f0' }}>
                    <Wind size={16} className="mx-auto mb-1" style={{ color: '#0ca678' }} />
                    <div className="text-base font-bold mono" style={{ color: '#1a1a2e' }}>{weather.wind_kmh}</div>
                    <div className="text-[10px]" style={{ color: '#9ba3c0' }}>km/h Wind</div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #e4e7f0' }}>
                    <Thermometer size={16} className="mx-auto mb-1" style={{ color: '#f76707' }} />
                    <div className="text-base font-bold mono" style={{ color: '#1a1a2e' }}>{weather.temperature}°</div>
                    <div className="text-[10px]" style={{ color: '#9ba3c0' }}>Feels Like</div>
                  </div>
                </div>
              </div>

              {/* Right — forecast */}
              <div className="p-6">
                <div className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: '#9ba3c0' }}>
                  {weather.forecast?.length}-Day Forecast
                </div>
                <div className="space-y-2">
                  {weather.forecast?.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', border: '1px solid #e4e7f055' }}>
                      <span className="text-xs font-semibold w-8" style={{ color: i === 0 ? '#1a1a2e' : '#5a6080' }}>{f.day}</span>
                      <span className="text-lg w-7">{ICONS[f.condition] || '🌡️'}</span>
                      <span className="text-xs flex-1" style={{ color: '#9ba3c0' }}>{f.condition}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold mono" style={{ color: '#1a1a2e' }}>{f.high}°</span>
                        <span className="text-xs mono" style={{ color: '#c0c8e0' }}>{f.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Droplets,    label: 'Humidity',    value: `${weather.humidity}%`,       color: '#0891b2', bg: '#ecfeff' },
              { icon: Wind,        label: 'Wind Speed',  value: `${weather.wind_kmh} km/h`,   color: '#0ca678', bg: '#e6f7f3' },
              { icon: Thermometer, label: 'Temperature', value: `${weather.temperature}°C`,   color: '#f76707', bg: '#fff7ed' },
              { icon: Gauge,       label: 'Condition',   value: weather.condition,             color: '#7048e8', bg: '#f3f0ff' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="card shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg, border: `1px solid ${color}22` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div className="text-[10px]" style={{ color: '#9ba3c0' }}>{label}</div>
                  <div className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Loading state */}
      {loading && !weather && (
        <div className="card shadow-card flex items-center justify-center py-20 gap-3">
          <RefreshCw size={18} className="animate-spin" style={{ color: '#0891b2' }} />
          <span className="text-sm" style={{ color: '#9ba3c0' }}>Loading weather...</span>
        </div>
      )}
    </div>
  )
}
