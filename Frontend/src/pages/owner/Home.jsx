import React, { useEffect, useState } from 'react'
import { fetchDashboardMetrics } from '../../services/ownerService'

export default function Home(){
  const [metrics, setMetrics] = useState(null)
  useEffect(()=>{
    fetchDashboardMetrics().then(d=>setMetrics(d)).catch(()=>{})
  },[])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">Total appointments<br/><strong>{metrics?.total || '-'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Pending<br/><strong>{metrics?.pending || '-'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Confirmed<br/><strong>{metrics?.confirmed || '-'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Completed<br/><strong>{metrics?.completed || '-'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Active barbers<br/><strong>{metrics?.active_barbers || '-'}</strong></div>
        <div className="p-4 bg-white rounded shadow">Active services<br/><strong>{metrics?.active_services || '-'}</strong></div>
      </div>
    </div>
  )
}
