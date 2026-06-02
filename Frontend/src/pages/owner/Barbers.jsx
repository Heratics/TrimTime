import React, { useEffect, useState } from 'react'
import { fetchBarbers, createBarber, updateBarber, deleteBarber } from '../../services/ownerService'

export default function Barbers(){
  const [barbers, setBarbers] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  useEffect(()=>{ fetchBarbers().then(r=>setBarbers(r.barbers||[])).catch(()=>{}) },[])

  function openNew(){ setEditing(null); setFormOpen(true) }
  function openEdit(b){ setEditing(b); setFormOpen(true) }

  async function submit(payload){
    if (editing) await updateBarber(editing.id, payload)
    else await createBarber(payload)
    const r = await fetchBarbers()
    setBarbers(r.barbers||[])
    setFormOpen(false)
  }

  async function remove(id){ if(!confirm('Disable barber?')) return; await deleteBarber(id); const r = await fetchBarbers(); setBarbers(r.barbers||[]) }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Barbers</h1>
      <div className="mb-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={openNew}>Add Barber</button>
      </div>

      {formOpen && (
        <BarberForm initial={editing} onCancel={()=>setFormOpen(false)} onSave={submit} />
      )}

      <div className="space-y-2">
        {barbers.map(b=> (
          <div key={b.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{b.full_name}</div>
              <div className="text-sm text-gray-600">{b.bio}</div>
            </div>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={()=>openEdit(b)}>Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={()=>remove(b.id)}>{b.is_active ? 'Disable' : 'Delete'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarberForm({ initial, onSave, onCancel }){
  const [full_name, setFullName] = useState(initial?.full_name||'')
  const [bio, setBio] = useState(initial?.bio||'')
  async function submit(e){ e.preventDefault(); await onSave({ full_name, bio }); }
  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow mb-4">
      <div className="mb-2"><input value={full_name} onChange={e=>setFullName(e.target.value)} className="w-full p-2 border" placeholder="Full name" required /></div>
      <div className="mb-2"><textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full p-2 border" placeholder="Bio" /></div>
      <div className="space-x-2"><button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Save</button><button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button></div>
    </form>
  )
}
