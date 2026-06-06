import React, { useEffect, useState } from 'react'
import { fetchAdminBarbers, updateAdminBarberStatus, deleteAdminBarber } from '../../services/adminService'
import api from '../../services/api'

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const response = await fetchAdminBarbers()
      setBarbers(response.barbers || [])
      setError('')
    } catch {
      setError('Unable to load barbers.')
    }
  }

  async function toggle(barber) {
    try {
      await updateAdminBarberStatus(barber.id, !barber.is_active)
      await load()
    } catch {
      setError('Unable to update that barber.')
    }
  }

  async function remove(barber) {
    if (!confirm(`Permanently delete ${barber.full_name}? This cannot be undone.`)) return
    try {
      await deleteAdminBarber(barber.id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete barber.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold">All Barbers</h1>
          <p className="mt-1 text-sm text-gray-600">Manage barbers and create their login accounts.</p>
        </header>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {showCreateForm ? 'Cancel' : '+ Create Barber Account'}
        </button>
      </div>

      {error && <ErrorMessage text={error} />}

      {showCreateForm && (
        <CreateBarberUserForm
          barbers={barbers.filter(b => !b.user_id)}
          onCreated={() => { setShowCreateForm(false); load() }}
          onError={setError}
        />
      )}

      <div className="space-y-2">
        {barbers.map(barber => (
          <div key={barber.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div>
              <div className="font-semibold">{barber.full_name}</div>
              <div className="text-sm text-gray-500">{barber.shop_name}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${barber.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {barber.is_active ? 'Active' : 'Inactive'}
                </span>
                {barber.user_id
                  ? <span className="text-xs text-blue-600">✓ Has login account</span>
                  : <span className="text-xs text-amber-600">⚠ No login account</span>
                }
              </div>
            </div>
            <div className="flex gap-2">
             <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(barber)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => toggle(barber)}
                className={`rounded-lg px-3 py-2 text-sm text-white ${barber.is_active ? 'bg-amber-500' : 'bg-green-600'}`}
              >
                {barber.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => remove(barber)}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
              >
                Delete
              </button>
            </div>
            </div>
          </div>
        ))}
        {barbers.length === 0 && (
          <div className="rounded-xl border border-dashed bg-white p-5 text-sm text-gray-500">
            No barbers on the platform yet.
          </div>
        )}
      </div>
    </div>
  )
}

function CreateBarberUserForm({ barbers, onCreated, onError }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', barber_id: '' })
  const [submitting, setSubmitting] = useState(false)

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/admin/barber-users', {
        ...form,
        barber_id: form.barber_id ? Number(form.barber_id) : undefined
      })
      onCreated()
    } catch (err) {
      onError(err?.response?.data?.error || 'Failed to create barber account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold mb-4">Create Barber Login Account</h2>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *">
            <input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="w-full rounded-lg border px-3 py-2" required />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-lg border px-3 py-2" required />
          </Field>
          <Field label="Password *">
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="w-full rounded-lg border px-3 py-2" required />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </Field>
        </div>
        {barbers.length > 0 && (
          <Field label="Link to barber profile (optional)">
            <select value={form.barber_id} onChange={e => update('barber_id', e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-white">
              <option value="">— Don't link yet —</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.full_name} ({b.shop_name})</option>
              ))}
            </select>
          </Field>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

function ErrorMessage({ text }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div>
}

{editing && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Edit {editing.full_name}</h2>
            <button onClick={() => setEditing(null)} className="text-sm text-gray-500">Close</button>
          </div>
          <div className="space-y-3">
            <Field label="Full Name">
              <input value={editing.full_name || ''} onChange={e => setEditing({ ...editing, full_name: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
            </Field>
            <Field label="Bio">
              <textarea value={editing.bio || ''} onChange={e => setEditing({ ...editing, bio: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2" />
            </Field>
          </div>
          <button
            onClick={async () => {
              try {
                await api.put(`/admin/barbers/${editing.id}`, { full_name: editing.full_name, bio: editing.bio })
                setEditing(null)
                await load()
              } catch {
                setError('Failed to save barber.')
              }
            }}
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      )}