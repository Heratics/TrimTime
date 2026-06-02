import React, { useEffect, useState } from 'react'
import { fetchAdminAppointments, updateAdminAppointmentStatus } from '../../services/adminService'

const statuses = ['pending', 'confirmed', 'completed', 'cancelled']

export default function Appointments(){
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{ load() },[])
  async function load(){ try { const response = await fetchAdminAppointments(); setAppointments(response.appointments || []); setError('') } catch { setError('Unable to load appointments.') } }
  async function updateStatus(id, status){ try { await updateAdminAppointmentStatus(id, status); await load() } catch { setError('Unable to update that appointment.') } }

  return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">All Appointments</h1><p className="mt-1 text-sm text-gray-600">View and override appointment status across the platform.</p></header>
      {error && <ErrorMessage text={error} />}
      <div className="space-y-2">
        {appointments.map(appointment=>(
          <div key={appointment.id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-semibold">{appointment.customer_name}</div><div className="text-sm text-gray-600">{appointment.shop_name} - {appointment.barber_name}</div><div className="text-sm text-gray-500">{toDateValue(appointment.appointment_date)} at {appointment.appointment_time} - {appointment.service_name}</div></div>
            <select value={appointment.status} onChange={event=>updateStatus(appointment.id, event.target.value)} className="rounded-lg border bg-white p-2 text-sm">
              {statuses.map(status=><option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
function ErrorMessage({ text }){ return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{text}</div> }
function toDateValue(value){ return value ? String(value).slice(0, 10) : '' }
