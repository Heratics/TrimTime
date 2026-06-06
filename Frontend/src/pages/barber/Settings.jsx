import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import ImageUpload from '../../components/ImageUpload'

export default function Settings() {
  const [tab, setTab] = useState('profile')

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-2">Manage your profile and account.</p>

      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'profile' ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('account')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'account' ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Account
        </button>
      </div>

      {tab === 'profile' ? <ProfileSettings /> : <AccountSettings />}
    </div>
  )
}

function ProfileSettings() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/barber/dashboard')
      .then(r => {
        const b = r.data.barber
        setForm({ full_name: b.full_name || '', bio: b.bio || '', profile_image_url: b.profile_image_url || '' })
      })
      .catch(() => setError('Unable to load profile.'))
  }, [])

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/barber/profile', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (form === null) return <div className="py-10 text-center text-sm text-gray-500">Loading…</div>

  return (
    <div className="max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-1">My Profile</h2>
      <p className="text-sm text-gray-500 mb-4">This is what customers see on your public profile.</p>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">Profile saved successfully.</div>}

      <form onSubmit={save} className="space-y-4">
        <ImageUpload
          label="Profile Photo"
          value={form.profile_image_url}
          onChange={v => update('profile_image_url', v)}
        />
        <Field label="Full Name">
          <input
            value={form.full_name}
            onChange={e => update('full_name', e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5"
            required
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={e => update('bio', e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2.5"
            placeholder="Short bio shown to customers…"
          />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

function AccountSettings() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) return setError('New passwords do not match.')
    if (form.new_password.length < 8) return setError('New password must be at least 8 characters.')
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.put('/auth/password', {
        current_password: form.current_password,
        new_password: form.new_password
      })
      setSuccess(true)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to change password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-4">Update your login password.</p>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">Password changed successfully.</div>}

      <form onSubmit={submit} className="space-y-4">
        <Field label="Current Password">
          <input type="password" value={form.current_password} onChange={e => update('current_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label="New Password">
          <input type="password" value={form.new_password} onChange={e => update('new_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label="Confirm New Password">
          <input type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <button type="submit" disabled={saving} className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}