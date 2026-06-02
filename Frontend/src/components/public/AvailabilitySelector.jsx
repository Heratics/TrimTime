import React from 'react'

export default function AvailabilitySelector({ slots, selected, loading, onSelect }){
  if (loading) return <div className="rounded-xl border border-dashed p-4 text-sm text-stone-500">Loading available times...</div>
  if (!slots.length) return <div className="rounded-xl border border-dashed p-4 text-sm text-stone-500">No available times for this date.</div>

  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map(slot=><button type="button" key={slot} onClick={()=>onSelect(slot)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${selected === slot ? 'border-stone-900 bg-stone-900 text-white' : 'bg-white hover:border-stone-500'}`}>{slot}</button>)}</div>
}
