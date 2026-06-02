import api from './api'

export async function fetchAvailability({ barber_id, service_id, date }){
  const res = await api.get('/availability', { params: { barber_id, service_id, date } })
  return res.data
}

export async function createAppointment(payload){
  const res = await api.post('/appointments', payload)
  return res.data
}
