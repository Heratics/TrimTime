import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopCard from '../../components/public/ShopCard'
import { fetchPublicShops } from '../../services/publicShopService'

export default function Shops(){
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({ search:searchParams.get('search') || '', district:'', open_now:false })
  const [shops, setShops] = useState([])
  const [districts, setDistricts] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{
    fetchPublicShops(filters).then(response=>{ setShops(response.shops || []); setDistricts(response.districts || []); setError('') }).catch(()=>setError('Unable to load shops right now.'))
  }, [filters.search, filters.district, filters.open_now])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header><p className="text-sm font-bold uppercase tracking-wider text-amber-700">Aqaba</p><h1 className="text-3xl font-black">Find your barber shop</h1><p className="mt-2 text-stone-600">Search by shop or barber name, then book your appointment online.</p></header>
      <div className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
        <input value={filters.search} onChange={event=>setFilters({...filters, search:event.target.value})} placeholder="Shop or barber name" className="rounded-xl border px-3 py-3" />
        <select value={filters.district} onChange={event=>setFilters({...filters, district:event.target.value})} className="rounded-xl border bg-white px-3 py-3"><option value="">All districts</option>{districts.map(district=><option key={district}>{district}</option>)}</select>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold"><input type="checkbox" checked={filters.open_now} onChange={event=>setFilters({...filters, open_now:event.target.checked})} /> Open now</label>
      </div>
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shops.map(shop=><ShopCard key={shop.id} shop={shop} />)}</div>
      {!error && shops.length === 0 && <div className="mt-6 rounded-2xl border border-dashed bg-white p-5 text-sm text-stone-500">No Aqaba shops match these filters.</div>}
    </div>
  )
}
