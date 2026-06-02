import React, { useEffect, useState } from 'react'
import { fetchMyAppointments, updateMyAppointmentStatus } from '../../services/barberService'

export default function Appointments(){
  const [statusFilter, setStatusFilter] = useState('')
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{ load() },[])

  async function load(){
    try {
      const response = await fetchMyAppointments()
      setAppointments(response.appointments || [])
      setError('')
    } catch {
      setError('Unable to load your appointments.')
    }
  }

  async function changeStatus(id, status){
    try {
      await updateMyAppointmentStatus(id, status)
      await load()
    } catch {
      setError('Unable to update that appointment.')
    }
  }

  const visibleAppointments = statusFilter
    ? appointments.filter(appointment => appointment.status === statusFilter)
    : appointments

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="mt-1 text-sm text-gray-600">Review and update appointments assigned to you.</p>
      </header>

      <select value={statusFilter} onChange={event=>setStatusFilter(event.target.value)} className="rounded-lg border bg-white p-2">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-3">
        {visibleAppointments.map(appointment=>(
          <div key={appointment.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{appointment.customer_name}</div>
              <div className="text-sm text-gray-600">{toDateValue(appointment.appointment_date)} at {appointment.appointment_time}</div>
              <div className="mt-1 text-sm text-gray-500">{appointment.service_name} - {appointment.service_duration} min - {appointment.status}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {appointment.status === 'pending' && <Action className="bg-green-600" onClick={()=>changeStatus(appointment.id, 'confirmed')}>Confirm</Action>}
              {appointment.status === 'confirmed' && <Action className="bg-blue-600" onClick={()=>changeStatus(appointment.id, 'completed')}>Complete</Action>}
              {['pending', 'confirmed'].includes(appointment.status) && <Action className="bg-red-500" onClick={()=>changeStatus(appointment.id, 'cancelled')}>Cancel</Action>}
            </div>
          </div>
        ))}
        {visibleAppointments.length === 0 && <EmptyState />}
      </div>
    </div>
  )
}

function Action({ className, onClick, children }){
  return <button type="button" className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${className}`} onClick={onClick}>{children}</button>
}

function EmptyState(){
  return <div className="rounded-xl border border-dashed bg-white p-5 text-sm text-gray-600">No appointments match this view.</div>
}

function toDateValue(value){
  return value ? String(value).slice(0, 10) : ''
}
