import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Image, Upload, Download, X, ZoomIn, FolderOpen } from 'lucide-react'

import API, { headers } from '../config'

export default function PhotosApp() {
  const [photos, setPhotos]     = useState([])
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const load = async () => {
    try { const { data } = await axios.get(`${API}/photos/list`, { headers }); setPhotos(data.photos) } catch {}
  }

  useEffect(() => { load() }, [])

  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const form = new FormData(); form.append('file', file)
    await axios.post(`${API}/photos/upload`, form, { headers })
    await load(); setUploading(false)
    e.target.value = ''
  }

  const download = (p, e) => {
    e.stopPropagation()
    const a = document.createElement('a'); a.href = p.data; a.download = p.name; a.click()
  }

  return (
    <div className="w-full space-y-5">
      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(26,26,46,0.88)', backdropFilter: 'blur(10px)' }}
          onClick={() => setSelected(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-card"
            style={{ background: '#fff', color: '#5a6080' }}>
            <X size={16} />
          </button>
          <img src={selected.data} alt={selected.name}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
            {selected.name}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#9ba3c0' }}>Gallery</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: '#fff0f6', color: '#d6336c', border: '1px solid #fbb6ce' }}>
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
        </div>
        <button onClick={() => fileRef.current.click()} disabled={uploading}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
          style={{ background: '#d6336c', color: '#fff', boxShadow: '0 2px 10px #d6336c33' }}>
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>

      {photos.length === 0 ? (
        /* Empty state */
        <div className="card shadow-card flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#fff0f6,#fdf2f8)', border: '1px solid #fbb6ce' }}>
            <FolderOpen size={32} style={{ color: '#f9a8d4' }} />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold mb-1" style={{ color: '#5a6080' }}>No photos yet</div>
            <div className="text-sm" style={{ color: '#9ba3c0' }}>Upload images or save snapshots from Camera</div>
          </div>
          <button onClick={() => fileRef.current.click()}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: '#d6336c', color: '#fff', boxShadow: '0 2px 10px #d6336c33' }}>
            <Upload size={14} /> Upload Your First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((p, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: '1px solid #e4e7f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onClick={() => setSelected(p)}>
              <img src={p.data} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                style={{ background: 'rgba(26,26,46,0.55)' }}>
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.95)' }}>
                    <ZoomIn size={15} style={{ color: '#1a1a2e' }} />
                  </div>
                  <button onClick={e => download(p, e)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.95)' }}>
                    <Download size={15} style={{ color: '#1a1a2e' }} />
                  </button>
                </div>
              </div>

              {/* Name tag on hover */}
              <div className="absolute bottom-0 left-0 right-0 px-2 py-2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.7))' }}>
                <span className="text-[9px] text-white/80 truncate block">{p.name}</span>
              </div>
            </div>
          ))}

          {/* Upload tile */}
          <button onClick={() => fileRef.current.click()}
            className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{ border: '2px dashed #fbb6ce', background: '#fff0f6' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fdf2f8'; e.currentTarget.style.borderColor = '#d6336c' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff0f6'; e.currentTarget.style.borderColor = '#fbb6ce' }}>
            <Upload size={20} style={{ color: '#f9a8d4' }} />
            <span className="text-[10px] font-medium" style={{ color: '#f9a8d4' }}>Add Photo</span>
          </button>
        </div>
      )}
    </div>
  )
}
