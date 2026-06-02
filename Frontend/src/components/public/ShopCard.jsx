import React from 'react'
import { Link } from 'react-router-dom'

export default function ShopCard({ shop }){
  return (
    <Link to={`/shop/${shop.slug}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="h-28 bg-gradient-to-br from-amber-100 to-stone-200">
        {shop.cover_image_url && <img src={shop.cover_image_url} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="p-4">
        <div className="-mt-10 mb-3 flex items-end justify-between gap-3">
          <Logo shop={shop} />
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${shop.is_open_now ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{shop.is_open_now ? 'Open now' : 'Closed'}</span>
        </div>
        <h2 className="font-bold group-hover:text-amber-700">{shop.name}</h2>
        <p className="mt-1 text-sm text-stone-500">{shop.district || 'Aqaba'}</p>
        <p className="mt-3 line-clamp-2 text-sm text-stone-600">{shop.description || 'Book your next barber appointment in Aqaba.'}</p>
      </div>
    </Link>
  )
}

function Logo({ shop }){
  if (shop.logo_url) return <img src={shop.logo_url} alt={`${shop.name} logo`} className="h-16 w-16 rounded-2xl border-4 border-white bg-white object-cover shadow-sm" />
  return <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-stone-900 text-xl font-bold text-white shadow-sm">{shop.name.slice(0, 1)}</div>
}
