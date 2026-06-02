import api from './api'

export async function fetchAdminDashboard(){ const res = await api.get('/admin/dashboard'); return res.data }
export async function fetchAdminShops(){ const res = await api.get('/admin/shops'); return res.data }
export async function updateAdminShop(id, payload){ const res = await api.put(`/admin/shops/${id}`, payload); return res.data }
export async function fetchAdminOwners(){ const res = await api.get('/admin/owners'); return res.data }
export async function fetchAdminBarbers(){ const res = await api.get('/admin/barbers'); return res.data }
export async function updateAdminBarberStatus(id, is_active){ const res = await api.put(`/admin/barbers/${id}/status`, { is_active }); return res.data }
export async function fetchAdminServices(){ const res = await api.get('/admin/services'); return res.data }
export async function updateAdminServiceStatus(id, is_active){ const res = await api.put(`/admin/services/${id}/status`, { is_active }); return res.data }
export async function fetchAdminAppointments(){ const res = await api.get('/admin/appointments'); return res.data }
export async function updateAdminAppointmentStatus(id, status){ const res = await api.put(`/admin/appointments/${id}/status`, { status }); return res.data }
