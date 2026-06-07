import React, { useEffect, useState } from 'react'
import { fetchAdminDashboard } from '../../services/adminService'

export default function Home(){
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(()=>{
    fetchAdminDashboard().then(setDashboard).catch(()=>setError('Unable to load the platform dashboard.'))
  },[])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="mt-1 text-sm text-gray-600">System-wide totals across every shop.</p>
      </header>
      {error && <ErrorMessage text={error} />}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Metric label="Shops" value={dashboard?.total_shops} />
        <Metric label="Owners" value={dashboard?.total_owners} />
        <Metric label="Barbers" value={dashboard?.total_barbers} />
        <Metric label="Active barbers" value={dashboard?.active_barbers} />
        <Metric label="Active services" value={dashboard?.active_services} />
        <Metric label="Appointments" value={dashboard?.total_appointments} />
      </div>
    </div>
  )
}

function Metric({ label, value }){
  return <div className="rounded-xl border bg-white p-4 shadow-md"><div className="text-sm text-gray-600">{label}</div><strong className="mt-1 block text-2xl">{value ?? '-'}</strong></div>
}

function ErrorMessage({ text }){
  return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div>
}
