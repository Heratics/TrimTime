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
export async function addMySchedule(data) {
  const res = await api.post('/barber/schedule', data)
  return res.data
}

export async function deleteMySchedule(id) {
  const res = await api.delete(`/barber/schedule/${id}`)
  return res.data
}

export async function addMyBreak(data) {
  const res = await api.post('/barber/breaks', data)
  return res.data
}

export async function deleteMyBreak(id) {
  const res = await api.delete(`/barber/breaks/${id}`)
  return res.data
}

export async function addMyTimeOff(data) {
  const res = await api.post('/barber/timeoff', data)
  return res.data
}

export async function deleteMyTimeOff(id) {
  const res = await api.delete(`/barber/timeoff/${id}`)
  return res.data
}