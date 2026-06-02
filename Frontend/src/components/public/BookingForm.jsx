import React from 'react'

export default function BookingForm({ form, onChange, onSubmit, submitting }){
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-semibold">Customer name<input required value={form.customer_name} onChange={event=>onChange({ ...form, customer_name:event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-3 font-normal" /></label>
      <label className="block text-sm font-semibold">Phone number<input required value={form.customer_phone} onChange={event=>onChange({ ...form, customer_phone:event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-3 font-normal" /></label>
      <button disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-stone-950 disabled:opacity-60">{submitting ? 'Booking...' : 'Confirm Appointment'}</button>
    </form>
  )
}
