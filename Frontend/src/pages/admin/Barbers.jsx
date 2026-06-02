import React, { useEffect, useState } from 'react'
import { fetchAdminBarbers, updateAdminBarberStatus } from '../../services/adminService'

export default function Barbers(){
  const [barbers, setBarbers] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{ load() },[])
  async function load(){ try { const response = await fetchAdminBarbers(); setBarbers(response.barbers || []); setError('') } catch { setError('Unable to load barbers.') } }
  async function toggle(barber){ try { await updateAdminBarberStatus(barber.id, !barber.is_active); await load() } catch { setError('Unable to update that barber.') } }

  return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">All Barbers</h1><p className="mt-1 text-sm text-gray-600">Platform-wide barber roster and activation controls.</p></header>
      {error && <ErrorMessage text={error} />}
      <div className="space-y-2">
        {barbers.map(barber=>(
          <div key={barber.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div><div className="font-semibold">{barber.full_name}</div><div className="text-sm text-gray-600">{barber.shop_name} - {barber.is_active ? 'Active' : 'Inactive'}</div></div>
            <button type="button" onClick={()=>toggle(barber)} className={`rounded-lg px-3 py-2 text-sm text-white ${barber.is_active ? 'bg-red-500' : 'bg-green-600'}`}>{barber.is_active ? 'Disable' : 'Enable'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
function ErrorMessage({ text }){ return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div> }
