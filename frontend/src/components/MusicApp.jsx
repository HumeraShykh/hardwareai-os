import { useState, useEffect } from 'react'
import axios from 'axios'
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Music, ListMusic } from 'lucide-react'

import API, { headers } from '../config'

export default function MusicApp() {
  const [tracks, setTracks] = useState([])
  const [player, setPlayer] = useState({ status: 'stopped', current: null, volume: 70 })

  useEffect(() => {
    axios.get(`${API}/music/list`, { headers }).then(({ data }) => { setTracks(data.tracks); setPlayer(data.player) }).catch(() => {})
  }, [])

  const ctrl = async (action, track = null) => {
    try { const { data } = await axios.post(`${API}/music/${action}${track ? `?track=${track}` : ''}`); setPlayer(data.player) } catch {}
  }

  const isPlaying = player.status === 'playing'
  const trackName = player.current ? player.current.replace('.mp3','').replace('.wav','') : 'No track selected'

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* ── Left — Player ── */}
      <div className="card shadow-card overflow-hidden">
        {/* Album art area */}
        <div className="relative p-8 flex flex-col items-center" style={{ background: 'linear-gradient(135deg,#f3f0ff,#fdf4ff,#fff)' }}>
          <div className="w-36 h-36 rounded-3xl flex items-center justify-center mb-5 shadow-card"
            style={{ background: 'linear-gradient(135deg,#7048e8,#9775fa,#c084fc)' }}>
            <span className={`text-6xl ${isPlaying ? 'animate-bounce' : ''}`}>🎵</span>
          </div>
          <div className="text-center">
            <div className="text-base font-bold mb-1" style={{ color: '#1a1a2e' }}>{trackName}</div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPlaying ? '#0ca678' : '#d0d5e8' }} />
              <span className="text-xs font-medium" style={{ color: isPlaying ? '#0ca678' : '#9ba3c0' }}>
                {player.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Progress bar */}
          <div>
            <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#e4e7f0' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: isPlaying ? '45%' : '0%', background: 'linear-gradient(90deg,#7048e8,#c084fc)' }} />
            </div>
            <div className="flex justify-between text-[10px] mono" style={{ color: '#c0c8e0' }}>
              <span>{isPlaying ? '1:23' : '0:00'}</span>
              <span>3:45</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => ctrl('stop')} className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: '#f5f6fa', border: '1px solid #e4e7f0', color: '#9ba3c0' }}>
              <Square size={14} />
            </button>
            <button onClick={() => ctrl('play')} className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: '#f5f6fa', border: '1px solid #e4e7f0', color: '#5a6080' }}>
              <SkipBack size={16} />
            </button>
            <button onClick={() => ctrl(isPlaying ? 'pause' : 'play')}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isPlaying ? 'linear-gradient(135deg,#7048e8,#9775fa)' : '#f3f0ff',
                border: `1px solid ${isPlaying ? 'transparent' : '#c5b8f8'}`,
                color: isPlaying ? '#fff' : '#7048e8',
                boxShadow: isPlaying ? '0 6px 20px #7048e844' : 'none'
              }}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button onClick={() => ctrl('next')} className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: '#f5f6fa', border: '1px solid #e4e7f0', color: '#5a6080' }}>
              <SkipForward size={16} />
            </button>
            <div className="w-10" />
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 px-2">
            <Volume2 size={14} style={{ color: '#9ba3c0' }} />
            <input type="range" min="0" max="100" value={player.volume}
              onChange={e => ctrl('volume', e.target.value)} className="flex-1" style={{ accentColor: '#7048e8' }} />
            <span className="text-xs mono w-8 text-right font-medium" style={{ color: '#9ba3c0' }}>{player.volume}%</span>
          </div>
        </div>
      </div>

      {/* ── Right — Track list ── */}
      <div className="card shadow-card flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #e4e7f0' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f3f0ff', border: '1px solid #c5b8f8' }}>
            <ListMusic size={14} style={{ color: '#7048e8' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Playlist</span>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#f3f0ff', color: '#7048e8' }}>{tracks.length} tracks</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: '#f5f6fa' }}>
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Music size={32} style={{ color: '#d0d5e8' }} />
              <div className="text-sm" style={{ color: '#9ba3c0' }}>No tracks found</div>
              <div className="text-xs" style={{ color: '#c0c8e0' }}>Add .mp3 files to backend/apps/music_files/</div>
            </div>
          ) : tracks.map((t, i) => {
            const isActive = player.current === t
            return (
              <button key={i} onClick={() => ctrl('play', t)}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left"
                style={{ background: isActive ? '#f3f0ff' : '#fff' }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = '#fafbff')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = '#fff')}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isActive ? '#f3f0ff' : '#f5f6fa', border: `1px solid ${isActive ? '#c5b8f8' : '#e4e7f0'}` }}>
                  {isActive && isPlaying
                    ? <span className="flex gap-0.5 items-end" style={{ height: '14px' }}>
                        {[0,1,2].map(j => <span key={j} className="w-0.5 rounded-full animate-bounce"
                          style={{ background: '#7048e8', height: `${6+j*4}px`, animationDelay: `${j*0.1}s` }} />)}
                      </span>
                    : <Music size={12} style={{ color: isActive ? '#7048e8' : '#c0c8e0' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: isActive ? '#7048e8' : '#1a1a2e' }}>
                    {t.replace('.mp3','').replace('.wav','')}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#9ba3c0' }}>Audio Track</div>
                </div>
                <span className="text-[10px] mono font-medium" style={{ color: '#c0c8e0' }}>0{i+1}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
