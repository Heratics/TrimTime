import React, { useState } from 'react'
import api from '../../services/api'

export default function Settings() {
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
    <div>
      <h1 className="text-2xl font-black mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account.</p>

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