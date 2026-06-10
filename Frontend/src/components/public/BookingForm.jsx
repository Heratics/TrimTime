import React from 'react'

export default function BookingForm({ form, onChange, onSubmit, submitting, t }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-stone-700">
        {t('booking_customer_name')}
        <input
          required
          value={form.customer_name}
          onChange={e => onChange({ ...form, customer_name: e.target.value })}
          className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        {t('booking_phone')}
        <input
          required
          value={form.customer_phone}
          onChange={e => onChange({ ...form, customer_phone: e.target.value })}
          className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 font-bold text-white disabled:opacity-40"
      >
        {submitting ? t('booking_confirming') : t('booking_confirm')}
      </button>
    </form>
  )
}