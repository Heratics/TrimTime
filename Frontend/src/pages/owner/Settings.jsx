import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Settings() {
  const [tab, setTab] = useState('shop')

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-2">Manage your shop and account.</p>

      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setTab('shop')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'shop' ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Shop Settings
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

      {tab === 'shop' ? <ShopSettings /> : <AccountSettings />}
    </div>
  )
}

function ShopSettings() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/shops/me')
      .then(r => setForm(r.data.shop || {}))
      .catch(err => {
        if (err?.response?.status === 404) setForm(false)
        else setError('Unable to load shop settings.')
      })
  }, [])

  function updateField(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    if (!form?.id) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const { id, owner_user_id, created_at, updated_at, is_featured, slug, city, country, latitude, longitude, ...shopPayload } = form
      await api.put('/shops/' + id, shopPayload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (form === null) return <div className="py-10 text-center text-sm text-gray-500">Loading…</div>

  if (form === false) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="text-gray-600 mb-4">You haven't set up a shop yet.</p>
        <Link to="/owner/setup" className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white">
          Set Up My Shop
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}
      <form onSubmit={save} className="space-y-4 max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <Field label="Shop Name">
          <input value={form.name || ''} onChange={e => updateField('name', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label="Description">
          <textarea value={form.description || ''} onChange={e => updateField('description', e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2.5" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <input value={form.phone || ''} onChange={e => updateField('phone', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={e => updateField('email', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="District">
            <input value={form.district || ''} onChange={e => updateField('district', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
          </Field>
          <Field label="Address">
            <input value={form.address || ''} onChange={e => updateField('address', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
          </Field>
        </div>
        <Field label="Google Maps URL">
          <input value={form.google_maps_url || ''} onChange={e => updateField('google_maps_url', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
        </Field>
        <Field label="Logo URL">
          <input value={form.logo_url || ''} onChange={e => updateField('logo_url', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
        </Field>
        <Field label="Cover Image URL">
          <input value={form.cover_image_url || ''} onChange={e => updateField('cover_image_url', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Password changed successfully.
        </div>
      )}

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
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
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