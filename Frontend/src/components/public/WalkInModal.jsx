import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

/**
 * WalkInModal
 * Props:
 *   shop      — the full shop object (with shop.id, shop.barbers, shop.services)
 *   onClose   — called when modal should close
 *   onSuccess — called with the created appointment object on success
 */
export default function WalkInModal({ shop, onClose, onSuccess }) {
  const { t } = useLanguage()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Pre-select first active barber and service
  useEffect(() => {
    const firstBarber = shop.barbers?.find(b => b.is_active)
    if (firstBarber) setBarberId(String(firstBarber.id))

    const firstService = shop.services?.find(s => s.is_active)
    if (firstService) setServiceId(String(firstService.id))
  }, [shop])

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSubmit() {
    setError('')
    if (!customerName.trim()) {
      setError(t('walkin_err_name') || 'Customer name is required.')
      return
    }
    if (!serviceId) {
      setError(t('walkin_err_service') || 'Please select a service.')
      return
    }
    if (!barberId) {
      setError(t('walkin_err_barber') || 'Please select a barber.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/appointments/walkin', {
        shop_id: shop.id,
        barber_id: Number(barberId),
        service_id: Number(serviceId),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null
      })
      onSuccess(res.data.appointment)
    } catch (err) {
      const msg = err?.response?.data?.error || (t('walkin_err_generic') || 'Failed to create walk-in. Please try again.')
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const activeBarbers = shop.barbers?.filter(b => b.is_active) || []
  const activeServices = shop.services?.filter(s => s.is_active) || []

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-black">{t('walkin_title') || 'Walk-In Appointment'}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              {t('walkin_label_name') || 'Customer Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t('walkin_placeholder_name') || 'e.g. Ahmad'}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Phone Number (optional) */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              {t('walkin_label_phone') || 'Phone Number'}
              <span className="ml-1 text-xs font-normal text-stone-400">({t('walkin_optional') || 'optional'})</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder={t('walkin_placeholder_phone') || '+962 7X XXX XXXX'}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Service */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              {t('walkin_label_service') || 'Service'} <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none bg-white"
            >
              {activeServices.length === 0 && (
                <option value="">{t('walkin_no_services') || 'No services available'}</option>
              )}
              {activeServices.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.duration_minutes} {t('walkin_min') || 'min'} ({s.price} JOD)
                </option>
              ))}
            </select>
          </div>

          {/* Barber */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              {t('walkin_label_barber') || 'Barber'} <span className="text-red-500">*</span>
            </label>
            <select
              value={barberId}
              onChange={e => setBarberId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none bg-white"
            >
              {activeBarbers.length === 0 && (
                <option value="">{t('walkin_no_barbers') || 'No barbers available'}</option>
              )}
              {activeBarbers.map(b => (
                <option key={b.id} value={b.id}>{b.full_name}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-stone-400">
            {t('walkin_note') || 'The earliest available slot for today will be assigned automatically.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            {t('walkin_cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !customerName.trim() || !serviceId || !barberId}
            className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {submitting
              ? (t('walkin_creating') || 'Creating…')
              : (t('walkin_submit') || 'Create Walk-In')}
          </button>
        </div>
      </div>
    </div>
  )
}