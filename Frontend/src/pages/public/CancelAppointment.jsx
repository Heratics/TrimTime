import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cancelAppointment } from '../../services/bookingService'
import { useLanguage } from '../../context/LanguageContext'

export default function CancelAppointment() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cancelled, setCancelled] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!confirmationNumber.trim() || !phoneNumber.trim()) {
      setError(t('cancel_err_required'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await cancelAppointment({ confirmationNumber: confirmationNumber.trim(), phoneNumber: phoneNumber.trim() })
      setCancelled(res.appointment)
    } catch (err) {
      setError(err?.response?.data?.error || t('cancel_err_generic'))
    } finally {
      setSubmitting(false)
    }
  }

  if (cancelled) return <SuccessScreen appointment={cancelled} slug={slug} t={t} />

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link to={slug ? `/shop/${slug}/book` : '/shops'} className="text-sm font-bold text-amber-700">
        ← {t('cancel_back')}
      </Link>

      <div className="mt-5 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-4xl mb-3 text-center">🗓️</div>
        <h1 className="text-2xl font-black text-center">{t('cancel_title')}</h1>
        <p className="mt-2 text-sm text-stone-500 text-center">{t('cancel_sub')}</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            {t('cancel_conf_label')}
            <input
              type="text"
              required
              placeholder={t('cancel_conf_placeholder')}
              value={confirmationNumber}
              onChange={e => setConfirmationNumber(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            {t('cancel_phone_label')}
            <input
              type="tel"
              required
              placeholder={t('cancel_phone_placeholder')}
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>

          <p className="text-xs text-stone-400">{t('cancel_hint')}</p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? t('cancel_submitting') : t('cancel_submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

function SuccessScreen({ appointment, slug, t }) {
  function formatDate(d) {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatTime(time) {
    if (!time) return ''
    const [h, m] = time.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border-2 border-red-200 bg-white p-8 shadow-md text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-black text-red-700">{t('cancel_success_title')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('cancel_success_sub')}</p>

        <div className="mt-6 rounded-2xl bg-stone-50 border p-5 text-left space-y-3">
          {appointment.customer_name && <Row label={t('cancel_success_name')} value={appointment.customer_name} />}
          {appointment.service_name && <Row label={t('cancel_success_service')} value={appointment.service_name} />}
          <Row label={t('cancel_success_date')} value={formatDate(appointment.appointment_date)} />
          <Row label={t('cancel_success_time')} value={formatTime(appointment.appointment_time)} />
          <div className="pt-2 border-t">
            <span className="inline-block rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
              {t('cancel_success_status')}
            </span>
          </div>
        </div>

        <Link
          to={slug ? `/shop/${slug}` : '/shops'}
          className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-bold text-white"
        >
          {t('cancel_success_back')}
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500 font-medium">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  )
}