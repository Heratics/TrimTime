import React, { useEffect, useState } from 'react'
import { fetchAdminServices, updateAdminServiceStatus, updateAdminService, deleteAdminService } from '../../services/adminService'

export default function Services() {
  const [services, setServices] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const response = await fetchAdminServices()
      setServices(response.services || [])
      setError('')
    } catch {
      setError('Unable to load services.')
    }
  }

  async function toggle(service) {
    try {
      await updateAdminServiceStatus(service.id, !service.is_active)
      await load()
    } catch {
      setError('Unable to update that service.')
    }
  }

  async function save(e) {
    e.preventDefault()
    try {
      await updateAdminService(editing.id, {
        name: editing.name,
        price: editing.price,
        duration_minutes: editing.duration_minutes,
        description: editing.description
      })
      setEditing(null)
      await load()
    } catch {
      setError('Unable to save service.')
    }
  }

  async function remove(service) {
    if (!confirm(`Permanently delete "${service.name}"? This cannot be undone.`)) return
    try {
      await deleteAdminService(service.id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete service.')
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">All Services</h1>
        <p className="mt-1 text-sm text-gray-600">Override service availability across any shop.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {editing && (
        <form onSubmit={save} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Edit {editing.name}</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-gray-500">Close</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Name" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} required />
            <Input label="Price" value={editing.price} onChange={v => setEditing({ ...editing, price: v })} />
            <Input label="Duration (minutes)" value={editing.duration_minutes} onChange={v => setEditing({ ...editing, duration_minutes: v })} />
            <Input label="Description" value={editing.description} onChange={v => setEditing({ ...editing, description: v })} />
          </div>
          <button className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Save Service</button>
        </form>
      )}

      <div className="space-y-2">
        {services.map(service => (
          <div key={service.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div>
              <div className="font-semibold">{service.name}</div>
              <div className="text-sm text-gray-600">{service.shop_name} — {service.price ? `${service.price} JOD` : 'No price'} — {service.duration_minutes ? `${service.duration_minutes} min` : ''}</div>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing({ ...service })} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
              <button onClick={() => toggle(service)} className={`rounded-lg px-3 py-2 text-sm text-white ${service.is_active ? 'bg-amber-500' : 'bg-green-600'}`}>
                {service.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => remove(service)} className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white">Delete</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="rounded-xl border border-dashed bg-white p-5 text-sm text-gray-500">No services yet.</div>}
      </div>
    </div>
  )
}

function Input({ label, value, onChange, required }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
      <input value={value || ''} onChange={e => onChange(e.target.value)} required={required} className="mt-1 w-full rounded-lg border px-3 py-2" />
    </label>
  )
}