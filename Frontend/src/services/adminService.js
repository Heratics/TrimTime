import api from './api'

export async function fetchAdminDashboard() { const res = await api.get('/admin/dashboard'); return res.data }
export async function fetchAdminShops() { const res = await api.get('/admin/shops'); return res.data }
export async function updateAdminShop(id, payload) { const res = await api.put(`/admin/shops/${id}`, payload); return res.data }
export async function fetchAdminOwners() { const res = await api.get('/admin/owners'); return res.data }
export async function fetchAdminBarbers() { const res = await api.get('/admin/barbers'); return res.data }
export async function updateAdminBarberStatus(id, is_active) { const res = await api.put(`/admin/barbers/${id}/status`, { is_active }); return res.data }
export async function fetchAdminServices() { const res = await api.get('/admin/services'); return res.data }
export async function updateAdminServiceStatus(id, is_active) { const res = await api.put(`/admin/services/${id}/status`, { is_active }); return res.data }
export async function fetchAdminAppointments() { const res = await api.get('/admin/appointments'); return res.data }
export async function updateAdminAppointmentStatus(id, status) { const res = await api.put(`/admin/appointments/${id}/status`, { status }); return res.data }
export async function createAdminBarberUser(payload) { const res = await api.post('/admin/barber-users', payload); return res.data }
export async function fetchAdminUsers() { const res = await api.get('/admin/users'); return res.data }
export async function fetchPendingOwners() { const res = await api.get('/admin/owners/pending'); return res.data }
export async function approveOwner(id) { const res = await api.put(`/admin/owners/${id}/approve`); return res.data }
export async function rejectOwner(id) { const res = await api.put(`/admin/owners/${id}/reject`); return res.data }
export async function disableOwner(id) { const res = await api.put(`/admin/owners/${id}/disable`); return res.data }
export async function deleteOwner(id) { const res = await api.delete(`/admin/owners/${id}`); return res.data }
export async function deleteAdminBarber(id) { const res = await api.delete(`/admin/barbers/${id}`); return res.data }
export async function toggleAdminShop(id) { const res = await api.put(`/admin/shops/${id}/toggle`); return res.data }
export async function deleteAdminShop(id) { const res = await api.delete(`/admin/shops/${id}`); return res.data }
export async function updateAdminService(id, payload) { const res = await api.put(`/admin/services/${id}`, payload); return res.data }
export async function deleteAdminService(id) { const res = await api.delete(`/admin/services/${id}`); return res.data }