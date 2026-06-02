import React from 'react'

export default function ServiceCard({ service, selected, onSelect }){
  return (
    <button type="button" onClick={()=>onSelect?.(service)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-400'}`}>
      <div className="flex items-start justify-between gap-3"><div><div className="font-bold">{service.name}</div><div className="mt-1 text-sm text-stone-500">{service.duration_minutes} minutes{service.category ? ` - ${service.category}` : ''}</div></div><strong>{formatPrice(service.price)}</strong></div>
    </button>
  )
}

function formatPrice(value){ return `${Number(value || 0).toFixed(2)} JOD` }
