import { useState } from 'react'
import { Cpu, Camera, Cloud, Music, Image, Wifi, Battery } from 'lucide-react'
import HardwarePanel from './components/HardwarePanel'
import CameraApp    from './components/CameraApp'
import WeatherApp   from './components/WeatherApp'
import MusicApp     from './components/MusicApp'
import PhotosApp    from './components/PhotosApp'
import { useTime }  from './hooks/useTime'

const APPS = [
  { id: 'hardware', label: 'Hardware', icon: Cpu,    bg: '#eef1fd', color: '#3b5bdb', dot: '#3b5bdb' },
  { id: 'camera',   label: 'Camera',   icon: Camera, bg: '#e6f7f3', color: '#0ca678', dot: '#0ca678' },
  { id: 'weather',  label: 'Weather',  icon: Cloud,  bg: '#ecfeff', color: '#0891b2', dot: '#0891b2' },
  { id: 'music',    label: 'Music',    icon: Music,  bg: '#f3f0ff', color: '#7048e8', dot: '#7048e8' },
  { id: 'photos',   label: 'Photos',   icon: Image,  bg: '#fff0f6', color: '#d6336c', dot: '#d6336c' },
]

export default function App() {
  const [active, setActive] = useState('hardware')
  const time = useTime()
  const cur = APPS.find(a => a.id === active)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f6fa' }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 shadow-sm"
        style={{ background: '#fff', borderBottom: '1px solid #e4e7f0' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg,#3b5bdb,#5c7cfa)' }}>
            <Cpu size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#1a1a2e' }}>HardwareAI OS</div>
            <div className="text-[10px]" style={{ color: '#9ba3c0' }}>Offline LLM · Demo v1.0</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="mono text-xs font-medium" style={{ color: '#9ba3c0' }}>{time}</span>
          <div className="flex items-center gap-1.5" style={{ color: '#9ba3c0' }}>
            <Wifi size={13} />
            <span className="text-xs">Local</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: '#9ba3c0' }}>
            <Battery size={13} />
            <span className="text-xs">100%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: '#e6f7f3', border: '1px solid #0ca67830' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0ca678' }} />
            <span className="text-xs font-medium" style={{ color: '#0ca678' }}>System Online</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="flex flex-col py-4 gap-1 shrink-0"
          style={{ width: '76px', background: '#fff', borderRight: '1px solid #e4e7f0' }}>
          {APPS.map(({ id, label, icon: Icon, bg, color }) => {
            const on = active === id
            return (
              <button key={id} onClick={() => setActive(id)}
                className="relative flex flex-col items-center gap-1.5 py-3 mx-2 rounded-xl transition-all duration-200"
                style={{
                  background: on ? bg : 'transparent',
                  color: on ? color : '#9ba3c0',
                }}>
                {on && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r" style={{ background: color }} />}
                <Icon size={17} />
                <span className="text-[9px] font-semibold tracking-wide">{label}</span>
              </button>
            )
          })}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Sub-header */}
          <div className="flex items-center gap-3 px-6 py-3 shrink-0"
            style={{ background: '#fff', borderBottom: '1px solid #e4e7f0' }}>
            <div className="w-2 h-5 rounded-full" style={{ background: cur.color }} />
            <span className="font-semibold text-sm" style={{ color: cur.color }}>{cur.label}</span>
            <div className="flex-1" />
            <div className="flex gap-1.5">
              {APPS.map(a => (
                <button key={a.id} onClick={() => setActive(a.id)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: active === a.id ? a.dot : '#e4e7f0', transform: active === a.id ? 'scale(1.3)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {active === 'hardware' && <HardwarePanel onAppOpen={setActive} />}
            {active === 'camera'   && <CameraApp  onClose={() => setActive('hardware')} />}
            {active === 'weather'  && <WeatherApp onClose={() => setActive('hardware')} />}
            {active === 'music'    && <MusicApp   onClose={() => setActive('hardware')} />}
            {active === 'photos'   && <PhotosApp  onClose={() => setActive('hardware')} />}
          </div>
        </main>
      </div>
    </div>
  )
}
