import api from './api'

export async function fetchBarberDashboard(){
  const res = await api.get('/barber/dashboard')
  return res.data
}

export async function fetchMyAppointments(){
  const res = await api.get('/appointments/barber')
  return res.data
}

export async function updateMyAppointmentStatus(id, status){
  const res = await api.put(`/appointments/${id}/status`, { status })
  return res.data
}

export async function fetchMySchedule(){
  const res = await api.get('/barber/schedule')
  return res.data
}
