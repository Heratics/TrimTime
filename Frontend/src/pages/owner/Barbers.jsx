import React, { useEffect, useState } from 'react'
import { fetchBarbers, createBarber, updateBarber, deleteBarber } from '../../services/ownerService'
import api from '../../services/api'
import ImageUpload from '../../components/ImageUpload'

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await fetchBarbers()
      setBarbers(r.barbers || [])
    } catch {
      setError('Unable to load barbers.')
    }
  }

  function openNew() { setEditing(null); setFormOpen(true) }
  function openEdit(b) { setEditing(b); setFormOpen(true) }

  async function submit(payload) {
    try {
      setError('')
      if (editing) await updateBarber(editing.id, payload)
      else await createBarber(payload)
      await load()
      setFormOpen(false)
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Failed to save barber.')
    }
  }

  // FIX: toggle is_active instead of deleting
  async function toggleActive(b) {
    const action = b.is_active ? 'Disable' : 'Enable'
    if (!confirm(`${action} ${b.full_name}?`)) return
    try {
      await updateBarber(b.id, { is_active: !b.is_active })
      await load()
    } catch {
      setError('Failed to update barber status.')
    }
  }

  async function remove(b) {
    if (!confirm(`Permanently delete ${b.full_name}? This cannot be undone.`)) return
    try {
      await deleteBarber(b.id)
      await load()
    } catch {
      setError('Failed to delete barber.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Barbers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your barbers and link them to login accounts.</p>
        </div>
        <button
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
          onClick={openNew}
        >
          + Add Barber
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {formOpen && (
        <BarberForm initial={editing} onCancel={() => setFormOpen(false)} onSave={submit} />
      )}

      <div className="space-y-2">
        {barbers.map(b => (
          <div key={b.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{b.full_name}</div>
                {b.bio && <div className="text-sm text-gray-500 mt-0.5">{b.bio}</div>}
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {b.user_id
                    ? <span className="text-xs text-blue-600">✓ Has login account</span>
                    : <span className="text-xs text-gray-400">No login account</span>
                  }
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => openEdit(b)}
                >
                  Edit
                </button>
                <button
                  className={`rounded-lg px-3 py-1.5 text-sm text-white ${b.is_active ? 'bg-amber-500' : 'bg-green-600'}`}
                  onClick={() => toggleActive(b)}
                >
                  {b.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white"
                  onClick={() => remove(b)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {barbers.length === 0 && !formOpen && (
          <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
            No barbers yet. Add your first barber above.
          </div>
        )}
      </div>
    </div>
  )
}

function BarberForm({ initial, onSave, onCancel }) {
  const [full_name, setFullName] = useState(initial?.full_name || '')
  const [bio, setBio] = useState(initial?.bio || '')
  const [profile_image_url, setProfileImageUrl] = useState(initial?.profile_image_url || '')
  const [is_active, setIsActive] = useState(initial?.is_active !== false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const payload = { full_name, bio, profile_image_url, is_active }
    if (!initial && email.trim()) {
      payload.email = email.trim()
      payload.password = password
    }
    await onSave(payload)
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm mb-2">
      <h2 className="font-semibold mb-4">{initial ? 'Edit Barber' : 'Add New Barber'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            value={full_name}
            onChange={e => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2.5"
            placeholder="Short bio shown on the public profile"
          />
        </div>
        <ImageUpload
          label="Profile Image"
          value={profile_image_url}
          onChange={v => setProfileImageUrl(v)}
        />
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={is_active}
            onChange={e => setIsActive(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
        </div>

        {!initial && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-stone-700">Login Account <span className="font-normal text-stone-400">(optional)</span></p>
            <p className="text-xs text-stone-500">Fill these in to automatically create a login account for this barber.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="barber@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Save Barber
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
