import React, { useEffect, useState } from 'react'
import { fetchAdminServices, updateAdminServiceStatus } from '../../services/adminService'

export default function Services(){
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{ load() },[])
  async function load(){ try { const response = await fetchAdminServices(); setServices(response.services || []); setError('') } catch { setError('Unable to load services.') } }
  async function toggle(service){ try { await updateAdminServiceStatus(service.id, !service.is_active); await load() } catch { setError('Unable to update that service.') } }

  return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">All Services</h1><p className="mt-1 text-sm text-gray-600">Override service availability across any shop.</p></header>
      {error && <ErrorMessage text={error} />}
      <div className="space-y-2">
        {services.map(service=>(
          <div key={service.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div><div className="font-semibold">{service.name}</div><div className="text-sm text-gray-600">{service.shop_name} - {service.is_active ? 'Active' : 'Inactive'}</div></div>
            <button type="button" onClick={()=>toggle(service)} className={`rounded-lg px-3 py-2 text-sm text-white ${service.is_active ? 'bg-red-500' : 'bg-green-600'}`}>{service.is_active ? 'Disable' : 'Enable'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
function ErrorMessage({ text }){ return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div> }
