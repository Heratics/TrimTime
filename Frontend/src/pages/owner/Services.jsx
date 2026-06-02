import React, { useEffect, useState } from 'react'
import { fetchServices, createService, updateService, deleteService } from '../../services/ownerService'

export default function Services(){
  const [services, setServices] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  useEffect(()=>{ fetchServices().then(r=>setServices(r.services||[])).catch(()=>{}) },[])

  function openNew(){ setEditing(null); setFormOpen(true) }
  function openEdit(s){ setEditing(s); setFormOpen(true) }

  async function submit(payload){
    if (editing) await updateService(editing.id, payload)
    else await createService(payload)
    const r = await fetchServices()
    setServices(r.services||[])
    setFormOpen(false)
  }

  async function remove(id){ if(!confirm('Disable service?')) return; await deleteService(id); const r = await fetchServices(); setServices(r.services||[]) }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <div className="mb-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={openNew}>Add Service</button>
      </div>

      {formOpen && (
        <ServiceForm initial={editing} onCancel={()=>setFormOpen(false)} onSave={submit} />
      )}

      <div className="space-y-2">
        {services.map(s=> (
          <div key={s.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{s.name} — {s.category}</div>
              <div className="text-sm text-gray-600">{s.description}</div>
            </div>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={()=>openEdit(s)}>Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={()=>remove(s.id)}>{s.is_active ? 'Disable' : 'Delete'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceForm({ initial, onSave, onCancel }){
  const [name, setName] = useState(initial?.name||'')
  const [category, setCategory] = useState(initial?.category||'')
  const [description, setDescription] = useState(initial?.description||'')
  const [duration, setDuration] = useState(initial?.duration_minutes||30)
  const [price, setPrice] = useState(initial?.price||0)
  async function submit(e){ e.preventDefault(); await onSave({ name, category, description, duration_minutes: Number(duration), price: Number(price) }); }
  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow mb-4">
      <div className="mb-2"><input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border" placeholder="Service name" required /></div>
      <div className="mb-2"><input value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border" placeholder="Category" /></div>
      <div className="mb-2"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border" placeholder="Description" /></div>
      <div className="mb-2 flex gap-2"><input value={duration} onChange={e=>setDuration(e.target.value)} className="p-2 border w-1/2" placeholder="Duration minutes" type="number"/><input value={price} onChange={e=>setPrice(e.target.value)} className="p-2 border w-1/2" placeholder="Price" type="number" step="0.01"/></div>
      <div className="space-x-2"><button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Save</button><button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button></div>
    </form>
  )
}
