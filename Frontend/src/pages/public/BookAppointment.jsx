import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AvailabilitySelector from '../../components/public/AvailabilitySelector'
import BarberCard from '../../components/public/BarberCard'
import BookingForm from '../../components/public/BookingForm'
import ServiceCard from '../../components/public/ServiceCard'
import { createAppointment, fetchAvailability } from '../../services/bookingService'
import { fetchPublicShop } from '../../services/publicShopService'
import { useLanguage } from '../../context/LanguageContext'

export default function BookAppointment() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [shop, setShop] = useState(null)
  const [step, setStep] = useState(1)
  const [selection, setSelection] = useState({ barber: null, service: null, date: '', time: '' })
  const [form, setForm] = useState({ customer_name: '', customer_phone: '' })
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    fetchPublicShop(slug).then(response => setShop(response.shop)).catch(() => setError(t('book_not_found')))
  }, [slug])

  async function loadSlots() {
    if (!selection.date) return setError(t('book_err_date'))
    setLoadingSlots(true); setError(''); setSlots([]); setSelection({ ...selection, time: '' })
    try {
      const response = await fetchAvailability({ barber_id: selection.barber.id, service_id: selection.service.id, date: selection.date })
      setSlots(response.slots || []); setStep(4)
    } catch (err) {
      setError(getApiError(err, t))
    } finally {
      setLoadingSlots(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!selection.time) return setError(t('book_err_time'))
    setSubmitting(true); setError('')
    try {
      const response = await createAppointment({ shop_id: shop.id, barber_id: selection.barber.id, service_id: selection.service.id, appointment_date: selection.date, appointment_time: selection.time, ...form })
      setAppointment(response.appointment)
    } catch (err) {
      setError(getApiError(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  if (!shop && !error) return <Message text={t('book_loading')} />
  if (!shop) return <Message text={error} />
  if (appointment) return <Success shop={shop} selection={selection} appointment={appointment} t={t} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/shop/${slug}`} className="text-sm font-bold text-amber-700">{t('book_back')} {shop.name}</Link>
      <h1 className="mt-3 text-3xl font-black">{t('book_title')}</h1>
      <p className="mt-1 text-stone-600">{t('book_sub')}</p>
      <div className="mt-5 flex gap-2">
        {[1, 2, 3, 4, 5].map(number => (
          <div key={number} className={`h-2 flex-1 rounded-full ${step >= number ? 'bg-amber-500' : 'bg-stone-200'}`} />
        ))}
      </div>

      {/* Cancel Appointment secondary link */}
      <div className="mt-4 text-center">
        <Link
          to={`/shop/${slug}/cancel`}
          className="text-sm text-stone-500 underline underline-offset-2 hover:text-stone-800"
        >
          {t('cancel_appointment_link')}
        </Link>
      </div>

      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <Section title={t('book_step1')}>
          {shop.barbers.map(barber => (
            <BarberCard key={barber.id} barber={barber} selected={selection.barber?.id === barber.id} onSelect={item => { setSelection({ ...selection, barber: item }); setError('') }} />
          ))}
          <Continue disabled={!selection.barber} onClick={() => selection.barber ? setStep(2) : setError(t('book_err_barber'))} t={t} />
        </Section>
      )}
      {step === 2 && (
        <Section title={t('book_step2')}>
          {shop.services.map(service => (
            <ServiceCard key={service.id} service={service} selected={selection.service?.id === service.id} onSelect={item => { setSelection({ ...selection, service: item }); setError('') }} />
          ))}
          <Navigation onBack={() => setStep(1)} disabled={!selection.service} onNext={() => selection.service ? setStep(3) : setError(t('book_err_service'))} t={t} />
        </Section>
      )}
      {step === 3 && (
        <Section title={t('book_step3')}>
          <input type="date" min={today()} value={selection.date} onChange={event => setSelection({ ...selection, date: event.target.value, time: '' })} className="w-full rounded-xl border bg-white px-3 py-3" />
          <Navigation onBack={() => setStep(2)} disabled={!selection.date || loadingSlots} onNext={loadSlots} nextText={loadingSlots ? t('book_loading_slots') : t('book_load_availability')} t={t} />
        </Section>
      )}
      {step === 4 && (
        <Section title={t('book_step4')}>
          <AvailabilitySelector slots={slots} selected={selection.time} loading={loadingSlots} onSelect={time => { setSelection({ ...selection, time }); setError('') }} t={t} />
          <Navigation onBack={() => setStep(3)} disabled={!selection.time} onNext={() => selection.time ? setStep(5) : setError(t('book_err_time'))} t={t} />
        </Section>
      )}
      {step === 5 && (
        <Section title={t('book_step5')}>
          <BookingForm form={form} onChange={setForm} onSubmit={submit} submitting={submitting} t={t} />
          <button type="button" onClick={() => setStep(4)} className="text-sm font-bold text-stone-500">{t('book_back_to_times')}</button>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-6 space-y-3 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-black">{title}</h2>
      {children}
    </section>
  )
}

function Continue({ disabled, onClick, t }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="w-full rounded-xl bg-stone-900 px-4 py-3 font-bold text-white disabled:opacity-40">
      {t('book_continue')}
    </button>
  )
}

function Navigation({ onBack, onNext, disabled, nextText, t }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onBack} className="rounded-xl border px-4 py-3 font-bold">{t('book_back_btn')}</button>
      <button type="button" disabled={disabled} onClick={onNext} className="flex-1 rounded-xl bg-stone-900 px-4 py-3 font-bold text-white disabled:opacity-40">
        {nextText || t('book_continue')}
      </button>
    </div>
  )
}

function Message({ text }) {
  return <div className="mx-auto max-w-6xl px-4 py-14 text-stone-600">{text}</div>
}

function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getApiError(err, t) {
  return err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || t('book_err_generic')
}

function Success({ shop, selection, appointment, t }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border-2 border-green-200 bg-white p-8 shadow-md text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-black text-green-700">{t('book_success_title')}</h1>
        <p className="mt-1 text-sm text-stone-500">{t('book_success_sub')}</p>
        <div className="mt-6 rounded-2xl bg-stone-50 border p-5 text-left space-y-3">
          <Row label={t('book_success_conf')} value={`#${appointment.id}`} />
          <Row label={t('book_success_shop')} value={shop.name} />
          <Row label={t('book_success_barber')} value={selection.barber.full_name} />
          <Row label={t('book_success_service')} value={selection.service.name} />
          <Row label={t('book_success_date')} value={selection.date} />
          <Row label={t('book_success_time')} value={selection.time} />
          {appointment.customer_name && <Row label={t('book_success_name')} value={appointment.customer_name} />}
          {appointment.customer_phone && <Row label={t('book_success_phone')} value={appointment.customer_phone} />}
          <div className="pt-2 border-t">
            <span className="inline-block rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
              {t('book_success_pending')}
            </span>
          </div>
        </div>

        {/* Cancel Appointment button — secondary, visually distinct */}
        <div className="mt-4">
          <Link
            to={`/shop/${shop.slug}/cancel`}
            className="inline-block rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            {t('cancel_appointment_link')}
          </Link>
        </div>

        <Link to={`/shop/${shop.slug}`} className="mt-3 inline-block rounded-xl bg-stone-900 px-6 py-3 font-bold text-white">
          {t('book_success_back')} {shop.name}
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