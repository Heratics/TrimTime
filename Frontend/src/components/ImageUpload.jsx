import React, { useState } from 'react'

const CLOUD_NAME = 'dnixvzlpj'
const UPLOAD_PRESET = 'TrimTime'

export default function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.secure_url) {
        onChange(data.secure_url)
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && <span className="block text-sm font-medium text-stone-700">{label}</span>}

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 rounded-xl object-cover border shadow-sm"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 text-xs flex items-center justify-center shadow"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="h-24 w-24 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs">
          No image
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer w-fit ${uploading ? 'opacity-50 pointer-events-none' : 'hover:bg-stone-50'}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
          {uploading ? 'Uploading…' : '📁 Choose Photo'}
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">or paste a URL</span>
        </div>

        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}