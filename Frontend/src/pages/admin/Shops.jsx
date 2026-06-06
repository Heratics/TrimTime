import React, { useEffect, useState } from 'react'
import { fetchAdminShops, updateAdminShop, toggleAdminShop, deleteAdminShop } from '../../services/adminService'

export default function Shops() {
  const [shops, setShops] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const response = await fetchAdminShops()
      setShops(response.shops || [])
      setError('')
    } catch {
      setError('Unable to load shops.')
    }
  }

  async function save(e) {
    e.preventDefault()
    try {
      await updateAdminShop(editing.id, editing)
      setEditing(null)
      await load()
    } catch {
      setError('Unable to update that shop.')
    }
  }

  async function toggle(shop) {
    try {
      await toggleAdminShop(shop.id)
      await load()
    } catch {
      setError('Unable to toggle shop.')
    }
  }

  async function remove(shop) {
    if (!confirm(`Permanently delete ${shop.name}? This cannot be undone.`)) return
    try {
      await deleteAdminShop(shop.id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete shop.')
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">All Shops</h1>
        <p className="mt-1 text-sm text-gray-600">View every shop and override its public settings.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {editing && (
        <form onSubmit={save} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Edit {editing.name}</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-gray-500">Close</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Shop name" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} required />
            <Input label="Phone" value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} />
            <Input label="Email" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} />
            <Input label="City" value={editing.city} onChange={v => setEditing({ ...editing, city: v })} />
            <Input label="District" value={editing.district} onChange={v => setEditing({ ...editing, district: v })} />
            <Input label="Address" value={editing.address} onChange={v => setEditing({ ...editing, address: v })} />
          </div>
          <button className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Save Shop</button>
        </form>
      )}

      <div className="space-y-2">
        {shops.map(shop => (
          <div key={shop.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{shop.name}</div>
              <div className="text-sm text-gray-600">{shop.city || 'No city'} — {shop.address || 'No address'}</div>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${shop.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {shop.is_active !== false ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing({ ...shop })} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
              <button onClick={() => toggle(shop)} className={`rounded-lg px-3 py-2 text-sm text-white ${shop.is_active !== false ? 'bg-amber-500' : 'bg-green-600'}`}>
                {shop.is_active !== false ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => remove(shop)} className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white">Delete</button>
            </div>
          </div>
        ))}
        {shops.length === 0 && <div className="rounded-xl border border-dashed bg-white p-5 text-sm text-gray-500">No shops yet.</div>}
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