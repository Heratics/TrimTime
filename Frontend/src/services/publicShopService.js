import api from './api'

export async function fetchPublicShops(filters = {}){
  const params = {}
  if (filters.search) params.search = filters.search
  if (filters.district) params.district = filters.district
  if (filters.open_now) params.open_now = true
  const res = await api.get('/public/shops', { params })
  return res.data
}

export async function fetchPublicShop(slug){
  const res = await api.get(`/public/shops/${slug}`)
  return res.data
}
