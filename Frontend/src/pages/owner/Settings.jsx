import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Settings(){
  const [form, setForm] = useState({})
  useEffect(()=>{
    api.get('/shops/me').then(r=>setForm(r.data.shop || {})).catch(()=>setForm({}))
  },[])

  function updateField(k,v){ setForm({...form,[k]:v}) }
  async function save(){
    if (!form.id) return
    await api.put('/shops/' + form.id, form)
    alert('Saved')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shop Settings</h1>
      <div className="space-y-3 max-w-xl">
        <input value={form.name||''} onChange={e=>updateField('name',e.target.value)} className="w-full p-2 border" placeholder="Shop name" />
        <textarea value={form.description||''} onChange={e=>updateField('description',e.target.value)} className="w-full p-2 border" placeholder="Description" />
        <input value={form.address||''} onChange={e=>updateField('address',e.target.value)} className="w-full p-2 border" placeholder="Address" />
        <input value={form.district||''} onChange={e=>updateField('district',e.target.value)} className="w-full p-2 border" placeholder="District" />
        <input value={form.google_maps_url||''} onChange={e=>updateField('google_maps_url',e.target.value)} className="w-full p-2 border" placeholder="Google Maps URL" />
        <input value={form.logo_url||''} onChange={e=>updateField('logo_url',e.target.value)} className="w-full p-2 border" placeholder="Logo URL" />
        <input value={form.cover_image_url||''} onChange={e=>updateField('cover_image_url',e.target.value)} className="w-full p-2 border" placeholder="Cover Image URL" />
        <div><button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div>
      </div>
    </div>
  )
}
