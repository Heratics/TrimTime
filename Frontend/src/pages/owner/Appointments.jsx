import React, { useEffect, useState } from 'react'
import { fetchAppointments, updateAppointmentStatus } from '../../services/ownerService'

export default function Appointments(){
  const [statusFilter, setStatusFilter] = useState('')
  const [appointments, setAppointments] = useState([])

  useEffect(()=>{
    load()
  },[statusFilter])

  function load(){
    fetchAppointments(statusFilter).then(r=>setAppointments(r.appointments || [])).catch(()=>{})
  }

  async function changeStatus(id, status){
    await updateAppointmentStatus(id, status)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="mb-4">
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="space-y-2">
        {appointments.map(a=> (
          <div key={a.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{a.customer_name} — {a.appointment_date} {a.appointment_time}</div>
              <div className="text-sm text-gray-600">{a.service_name} • {a.service_duration} min • {a.status}</div>
            </div>
            <div className="space-x-2">
              {a.status === 'pending' && <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={()=>changeStatus(a.id,'confirmed')}>Confirm</button>}
              {a.status === 'pending' && <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={()=>changeStatus(a.id,'cancelled')}>Cancel</button>}
              {a.status === 'confirmed' && <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>changeStatus(a.id,'completed')}>Complete</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
