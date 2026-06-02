import React from 'react'

export default function BarberCard({ barber, selected, onSelect }){
  return (
    <button type="button" onClick={()=>onSelect?.(barber)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-400'}`}>
      <div className="flex items-center gap-3">
        {barber.profile_image_url ? <img src={barber.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 font-bold text-white">{barber.full_name.slice(0, 1)}</div>}
        <div><div className="font-bold">{barber.full_name}</div><div className="text-sm text-stone-500">{barber.bio || 'Barber at this shop'}</div></div>
      </div>
    </button>
  )
}
