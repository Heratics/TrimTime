import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AvailabilitySelector from '../../components/public/AvailabilitySelector'
import BarberCard from '../../components/public/BarberCard'
import BookingForm from '../../components/public/BookingForm'
import ServiceCard from '../../components/public/ServiceCard'
import { createAppointment, fetchAvailability } from '../../services/bookingService'
import { fetchPublicShop } from '../../services/publicShopService'

export default function BookAppointment(){
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [step, setStep] = useState(1)
  const [selection, setSelection] = useState({ barber:null, service:null, date:'', time:'' })
  const [form, setForm] = useState({ customer_name:'', customer_phone:'' })
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [appointment, setAppointment] = useState(null)

  useEffect(()=>{ fetchPublicShop(slug).then(response=>setShop(response.shop)).catch(()=>setError('Shop not found.')) }, [slug])

  async function loadSlots(){
    if (!selection.date) return setError('Select a date to continue.')
    setLoadingSlots(true); setError(''); setSlots([]); setSelection({...selection, time:''})
    try {
      const response = await fetchAvailability({ barber_id:selection.barber.id, service_id:selection.service.id, date:selection.date })
      setSlots(response.slots || []); setStep(4)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoadingSlots(false)
    }
  }

  async function submit(event){
    event.preventDefault()
    if (!selection.time) return setError('Select a time to continue.')
    setSubmitting(true); setError('')
    try {
      const response = await createAppointment({ shop_id:shop.id, barber_id:selection.barber.id, service_id:selection.service.id, appointment_date:selection.date, appointment_time:selection.time, ...form })
      setAppointment(response.appointment); setStep(6)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!shop && !error) return <Message text="Loading booking page..." />
  if (!shop) return <Message text={error} />
  if (appointment) return <Success shop={shop} selection={selection} appointment={appointment} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/shop/${slug}`} className="text-sm font-bold text-amber-700">Back to {shop.name}</Link>
      <h1 className="mt-3 text-3xl font-black">Book Appointment</h1>
      <p className="mt-1 text-stone-600">Choose your barber, service, date, and time.</p>
      <div className="mt-5 flex gap-2">{[1,2,3,4,5].map(number=><div key={number} className={`h-2 flex-1 rounded-full ${step >= number ? 'bg-amber-500' : 'bg-stone-200'}`} />)}</div>
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {step === 1 && <Section title="1. Select Barber">{shop.barbers.map(barber=><BarberCard key={barber.id} barber={barber} selected={selection.barber?.id === barber.id} onSelect={item=>{ setSelection({...selection, barber:item}); setError('') }} />)}<Continue disabled={!selection.barber} onClick={()=>selection.barber ? setStep(2) : setError('Select a barber to continue.')} /></Section>}
      {step === 2 && <Section title="2. Select Service">{shop.services.map(service=><ServiceCard key={service.id} service={service} selected={selection.service?.id === service.id} onSelect={item=>{ setSelection({...selection, service:item}); setError('') }} />)}<Navigation onBack={()=>setStep(1)} disabled={!selection.service} onNext={()=>selection.service ? setStep(3) : setError('Select a service to continue.')} /></Section>}
      {step === 3 && <Section title="3. Select Date"><input type="date" min={today()} value={selection.date} onChange={event=>setSelection({...selection, date:event.target.value, time:''})} className="w-full rounded-xl border bg-white px-3 py-3" /><Navigation onBack={()=>setStep(2)} disabled={!selection.date || loadingSlots} onNext={loadSlots} nextText={loadingSlots ? 'Loading...' : 'Load Availability'} /></Section>}
      {step === 4 && <Section title="4. Select Time"><AvailabilitySelector slots={slots} selected={selection.time} loading={loadingSlots} onSelect={time=>{ setSelection({...selection, time}); setError('') }} /><Navigation onBack={()=>setStep(3)} disabled={!selection.time} onNext={()=>selection.time ? setStep(5) : setError('Select a time to continue.')} /></Section>}
      {step === 5 && <Section title="5. Your Details"><BookingForm form={form} onChange={setForm} onSubmit={submit} submitting={submitting} /><button type="button" onClick={()=>setStep(4)} className="text-sm font-bold text-stone-500">Back to times</button></Section>}
    </div>
  )
}

function Section({ title, children }){ return <section className="mt-6 space-y-3 rounded-2xl border bg-white p-4 shadow-sm sm:p-6"><h2 className="text-xl font-black">{title}</h2>{children}</section> }
function Continue({ disabled, onClick }){ return <button type="button" disabled={disabled} onClick={onClick} className="w-full rounded-xl bg-stone-900 px-4 py-3 font-bold text-white disabled:opacity-40">Continue</button> }
function Navigation({ onBack, onNext, disabled, nextText='Continue' }){ return <div className="flex gap-2"><button type="button" onClick={onBack} className="rounded-xl border px-4 py-3 font-bold">Back</button><button type="button" disabled={disabled} onClick={onNext} className="flex-1 rounded-xl bg-stone-900 px-4 py-3 font-bold text-white disabled:opacity-40">{nextText}</button></div> }
function Message({ text }){ return <div className="mx-auto max-w-6xl px-4 py-14 text-stone-600">{text}</div> }
function today(){ const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` }
function getApiError(err){ return err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.' }
function Success({ shop, selection, appointment }){
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border-2 border-green-200 bg-white p-8 shadow-md text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-black text-green-700">Appointment Booked!</h1>
        <p className="mt-1 text-sm text-stone-500">Screenshot this page as your confirmation.</p>
        <div className="mt-6 rounded-2xl bg-stone-50 border p-5 text-left space-y-3">
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Confirmation #</span><span className="font-semibold text-stone-800">#{appointment.id}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Shop</span><span className="font-semibold text-stone-800">{shop.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Barber</span><span className="font-semibold text-stone-800">{selection.barber.full_name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Service</span><span className="font-semibold text-stone-800">{selection.service.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Date</span><span className="font-semibold text-stone-800">{selection.date}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Time</span><span className="font-semibold text-stone-800">{selection.time}</span></div>
          {appointment.customer_name ? <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Name</span><span className="font-semibold text-stone-800">{appointment.customer_name}</span></div> : null}
          {appointment.customer_phone ? <div className="flex justify-between text-sm"><span className="text-stone-500 font-medium">Phone</span><span className="font-semibold text-stone-800">{appointment.customer_phone}</span></div> : null}
          <div className="pt-2 border-t">
            <span className="inline-block rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">Pending confirmation by shop</span>
          </div>
        </div>
        <Link to={`/shop/${shop.slug}`} className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-bold text-white">Back to {shop.name}</Link>
      </div>
    </div>
  )
}

function Row({ label, value }){
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500 font-medium">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  )
}