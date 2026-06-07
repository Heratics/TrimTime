import React, { useEffect, useState } from 'react'
import { fetchBarberDashboard } from '../../services/barberService'

export default function Home(){
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(()=>{
    fetchBarberDashboard().then(setDashboard).catch(()=>setError('Unable to load your dashboard.'))
  },[])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Welcome{dashboard?.barber?.full_name ? `, ${dashboard.barber.full_name}` : ''}</h1>
        <p className="mt-1 text-sm text-gray-600">A quick look at your appointment workload.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Metric label="Today's appointments" value={dashboard?.today_appointments} />
        <Metric label="Upcoming" value={dashboard?.upcoming_appointments} />
        <Metric label="Pending" value={dashboard?.pending_appointments} />
        <Metric label="Confirmed" value={dashboard?.confirmed_appointments} />
        <Metric label="Completed" value={dashboard?.completed_appointments} />
        <Metric label="All appointments" value={dashboard?.total_appointments} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <QuickLink to="/barber/appointments" label="My Appointments" />
        <QuickLink to="/barber/schedule" label="My Schedule" />
        <QuickLink to="/barber/settings" label="Settings" />
      </div>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <a href={to} className="rounded-xl border bg-white px-4 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center shadow-md hover:shadow-lg transition-shadow block">
      {label}
    </a>
  )
}

function Metric({ label, value }){
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md">
      <div className="text-sm text-gray-600">{label}</div>
      <strong className="mt-1 block text-2xl">{value ?? '-'}</strong>
    </div>
  )
}
