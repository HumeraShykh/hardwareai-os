import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, Download, Video, VideoOff, Save, Images, X } from 'lucide-react'
import axios from 'axios'

import API from '../config'

export default function CameraApp() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef   = useRef(null)
  const [status, setStatus]     = useState('idle')
  const [snapshot, setSnapshot] = useState(null)
  const [saved, setSaved]       = useState([])
  const [saving, setSaving]     = useState(false)
  const [tab, setTab]           = useState('live')
  const [selected, setSelected] = useState(null)

  const startCamera = useCallback(async () => {
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('active')
    } catch (e) {
      setStatus(e.name === 'NotAllowedError' ? 'denied' : 'error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('idle')
    setSnapshot(null)
  }, [])

  const takeSnapshot = () => {
    const video = videoRef.current, canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setSnapshot(canvas.toDataURL('image/jpeg', 0.9))
  }

  const saveSnapshot = async () => {
    if (!snapshot) return
    setSaving(true)
    try {
      const blob = await (await fetch(snapshot)).blob()
      const filename = `snapshot-${Date.now()}.jpg`
      const form = new FormData(); form.append('file', blob, filename)
      await axios.post(`${API}/photos/upload`, form)
      setSaved(p => [{ name: filename, data: snapshot }, ...p])
      setSnapshot(null); setTab('gallery')
    } catch { alert('Save failed — is backend running?') }
    setSaving(false)
  }

  const loadSaved = async () => {
    try {
      const { data } = await axios.get(`${API}/photos/list`)
      setSaved(data.photos.filter(p => p.name.startsWith('snapshot-')))
    } catch {}
  }

  useEffect(() => { startCamera(); loadSaved(); return () => stopCamera() }, [])

  return (
    <div className="w-full">
      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(26,26,46,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelected(null)}>
          <button className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#fff', color: '#5a6080' }} onClick={() => setSelected(null)}>
            <X size={16} />
          </button>
          <img src={selected} alt="snapshot" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Camera feed — 2/3 width ── */}
        <div className="lg:col-span-2 card shadow-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #e4e7f0', background: 'linear-gradient(135deg,#e6f7f3,#fff)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0ca678' }}>
                <Camera size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Live Camera</div>
                <div className="text-[10px]" style={{ color: '#9ba3c0' }}>Browser webcam · HD 720p</div>
              </div>
            </div>
            {status === 'active' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#fff0f0', border: '1px solid #fca5a5' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#e03131' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#e03131' }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Video */}
          <div className="relative aspect-video flex items-center justify-center" style={{ background: '#0f172a' }}>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${status === 'active' ? 'block' : 'hidden'}`} />
            <canvas ref={canvasRef} className="hidden" />

            {status === 'idle' && (
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#ffffff11', border: '1px solid #ffffff22' }}>
                  <Camera size={28} style={{ color: '#ffffff44' }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white/60">Camera is off</div>
                  <div className="text-xs text-white/30 mt-1">Click Start Camera to begin</div>
                </div>
              </div>
            )}
            {status === 'requesting' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0ca678', borderTopColor: 'transparent' }} />
                <span className="text-sm text-white/60">Requesting access...</span>
              </div>
            )}
            {status === 'denied' && (
              <div className="flex flex-col items-center gap-4">
                <VideoOff size={40} style={{ color: '#e03131', opacity: 0.6 }} />
                <div className="text-center">
                  <div className="text-sm font-medium text-white/70">Camera access denied</div>
                  <div className="text-xs text-white/40 mt-1">Allow camera in browser settings</div>
                </div>
                <button onClick={startCamera} className="text-xs font-semibold px-4 py-2 rounded-xl"
                  style={{ background: '#e03131', color: '#fff' }}>Try Again</button>
              </div>
            )}
          </div>

          {/* Snapshot preview */}
          {snapshot && (
            <div className="relative" style={{ borderTop: '1px solid #e4e7f0' }}>
              <img src={snapshot} alt="snapshot" className="w-full" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={saveSnapshot} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: '#0ca678', color: '#fff', boxShadow: '0 2px 8px #0ca67844' }}>
                  <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { const a = document.createElement('a'); a.href = snapshot; a.download = `snap-${Date.now()}.jpg`; a.click() }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                  <Download size={13} />
                </button>
                <button onClick={() => setSnapshot(null)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                  <X size={13} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 text-[10px] px-2 py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)' }}>
                Preview — click Save to keep
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="p-4 flex gap-3" style={{ borderTop: '1px solid #e4e7f0' }}>
            {status === 'active' ? (
              <>
                <button onClick={takeSnapshot}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
                  style={{ background: '#0ca678', color: '#fff', boxShadow: '0 2px 8px #0ca67833' }}>
                  <Camera size={15} /> Take Snapshot
                </button>
                <button onClick={stopCamera}
                  className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  style={{ background: '#fff0f0', border: '1px solid #fca5a5', color: '#e03131' }}>
                  <VideoOff size={15} /> Stop
                </button>
              </>
            ) : (
              <button onClick={startCamera} disabled={status === 'requesting'}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
                style={{ background: '#0ca678', color: '#fff', boxShadow: '0 2px 8px #0ca67833' }}>
                <Video size={15} /> Start Camera
              </button>
            )}
          </div>
        </div>

        {/* ── Right — Saved snapshots ── */}
        <div className="card shadow-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #e4e7f0' }}>
            <div className="flex items-center gap-2">
              <Images size={15} style={{ color: '#3b5bdb' }} />
              <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Saved</span>
              {saved.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#eef1fd', color: '#3b5bdb' }}>{saved.length}</span>
              )}
            </div>
            <button onClick={() => { loadSaved() }} className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
              style={{ background: '#f5f6fa', border: '1px solid #e4e7f0', color: '#9ba3c0' }}>
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {saved.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f5f6fa', border: '1px solid #e4e7f0' }}>
                  <Camera size={20} style={{ color: '#c0c8e0' }} />
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: '#9ba3c0' }}>No snapshots yet</div>
                  <div className="text-[10px] mt-1" style={{ color: '#c0c8e0' }}>Take a photo and save it</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {saved.map((p, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    style={{ border: '1px solid #e4e7f0' }} onClick={() => setSelected(p.data)}>
                    <img src={p.data} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5"
                      style={{ background: 'rgba(26,26,46,0.5)' }}>
                      <button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = p.data; a.download = p.name; a.click() }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                        <Download size={12} style={{ color: '#1a1a2e' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
