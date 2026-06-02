import React, { useEffect, useState } from 'react'
import { fetchAdminShops, updateAdminShop } from '../../services/adminService'

export default function Shops(){
  const [shops, setShops] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(()=>{ load() },[])

  async function load(){
    try {
      const response = await fetchAdminShops()
      setShops(response.shops || [])
      setError('')
    } catch {
      setError('Unable to load shops.')
    }
  }

  async function save(event){
    event.preventDefault()
    try {
      await updateAdminShop(editing.id, editing)
      setEditing(null)
      await load()
    } catch {
      setError('Unable to update that shop.')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="All Shops" text="View every shop and override its public settings." />
      {error && <ErrorMessage text={error} />}
      {editing && (
        <form onSubmit={save} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Edit {editing.name}</h2><button type="button" onClick={()=>setEditing(null)} className="text-sm text-gray-500">Close</button></div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Shop name" value={editing.name} onChange={value=>setEditing({...editing, name:value})} required />
            <Input label="Phone" value={editing.phone} onChange={value=>setEditing({...editing, phone:value})} />
            <Input label="Email" value={editing.email} onChange={value=>setEditing({...editing, email:value})} />
            <Input label="City" value={editing.city} onChange={value=>setEditing({...editing, city:value})} />
            <Input label="District" value={editing.district} onChange={value=>setEditing({...editing, district:value})} />
            <Input label="Address" value={editing.address} onChange={value=>setEditing({...editing, address:value})} />
          </div>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white" type="submit">Save Shop Settings</button>
        </form>
      )}
      <div className="space-y-2">
        {shops.map(shop=>(
          <div key={shop.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-semibold">{shop.name}</div><div className="text-sm text-gray-600">{shop.city || 'No city'} - {shop.address || 'No address'}</div></div>
            <button type="button" onClick={()=>setEditing({...shop})} className="self-start rounded-lg border px-3 py-2 text-sm sm:self-auto">Edit Settings</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageHeader({ title, text }){ return <header><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-gray-600">{text}</p></header> }
function ErrorMessage({ text }){ return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div> }
function Input({ label, value, onChange, required }){ return <label className="text-sm font-medium text-gray-700">{label}<input value={value || ''} onChange={event=>onChange(event.target.value)} required={required} className="mt-1 w-full rounded-lg border px-3 py-2" /></label> }
