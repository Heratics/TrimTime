import api from './api'

export async function fetchDashboardMetrics(){
  const res = await api.get('/owner/dashboard')
  return res.data
}

export async function fetchAppointments(status){
  const res = await api.get('/appointments/shop' + (status ? `?status=${status}` : ''))
  return res.data
}

export async function updateAppointmentStatus(id, status){
  const res = await api.put(`/appointments/${id}/status`, { status })
  return res.data
}

export async function fetchBarbers(){
  const res = await api.get('/barbers/shop')
  return res.data
}

export async function fetchServices(){
  const res = await api.get('/services')
  return res.data
}

// Shop hours
export async function getShopHours(){
  const res = await api.get('/shop-hours')
  return res.data
}
export async function createShopHours(payload){
  const res = await api.post('/shop-hours', payload)
  return res.data
}
export async function updateShopHours(id, payload){
  const res = await api.put(`/shop-hours/${id}`, payload)
  return res.data
}
export async function deleteShopHours(id){
  const res = await api.delete(`/shop-hours/${id}`)
  return res.data
}

// Barber schedule / breaks / time-off (barberId must be provided)
export async function listBarberSchedule(barberId){ const res = await api.get(`/barbers/${barberId}/schedule`); return res.data }
export async function createBarberSchedule(barberId, payload){ const res = await api.post(`/barbers/${barberId}/schedule`, payload); return res.data }
export async function updateBarberSchedule(barberId, scheduleId, payload){ const res = await api.put(`/barbers/${barberId}/schedule/${scheduleId}`, payload); return res.data }
export async function deleteBarberSchedule(barberId, scheduleId){ const res = await api.delete(`/barbers/${barberId}/schedule/${scheduleId}`); return res.data }

export async function listBarberBreaks(barberId){ const res = await api.get(`/barbers/${barberId}/breaks`); return res.data }
export async function createBarberBreak(barberId, payload){ const res = await api.post(`/barbers/${barberId}/breaks`, payload); return res.data }
export async function updateBarberBreak(barberId, breakId, payload){ const res = await api.put(`/barbers/${barberId}/breaks/${breakId}`, payload); return res.data }
export async function deleteBarberBreak(barberId, breakId){ const res = await api.delete(`/barbers/${barberId}/breaks/${breakId}`); return res.data }

export async function listBarberTimeOff(barberId){ const res = await api.get(`/barbers/${barberId}/time-off`); return res.data }
export async function createBarberTimeOff(barberId, payload){ const res = await api.post(`/barbers/${barberId}/time-off`, payload); return res.data }
export async function updateBarberTimeOff(barberId, timeOffId, payload){ const res = await api.put(`/barbers/${barberId}/time-off/${timeOffId}`, payload); return res.data }
export async function deleteBarberTimeOff(barberId, timeOffId){ const res = await api.delete(`/barbers/${barberId}/time-off/${timeOffId}`); return res.data }

// Barber CRUD
export async function createBarber(payload){
  const res = await api.post('/barbers', payload)
  return res.data
}
export async function updateBarber(id, payload){
  const res = await api.put(`/barbers/${id}`, payload)
  return res.data
}
export async function deleteBarber(id){
  const res = await api.delete(`/barbers/${id}`)
  return res.data
}

// Service CRUD
export async function createService(payload){
  const res = await api.post('/services', payload)
  return res.data
}
export async function updateService(id, payload){
  const res = await api.put(`/services/${id}`, payload)
  return res.data
}
export async function deleteService(id){
  const res = await api.delete(`/services/${id}`)
  return res.data
}

export async function fetchProducts() {
  const res = await api.get('/products')
  return res.data
}

export async function createProduct(data) {
  const res = await api.post('/products', data)
  return res.data
}

export async function updateProduct(id, data) {
  const res = await api.put(`/products/${id}`, data)
  return res.data
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`)
  return res.data
}