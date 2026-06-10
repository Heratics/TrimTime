import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerAppointments() {
  const { t } = useLanguage()
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.get('/owner/appointments')
      setAppointments(res.data.appointments || [])
    } catch {
      setError('Unable to load appointments.')
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/owner/appointments/${id}/status`, { status })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch {
      alert('Failed to update appointment.')
    }
  }

  const filters = [
    { key: 'all', label: t('appt_filter_all') },
    { key: 'pending', label: t('appt_filter_pending') },
    { key: 'confirmed', label: t('appt_filter_confirmed') },
    { key: 'completed', label: t('appt_filter_completed') },
    { key: 'cancelled', label: t('appt_filter_cancelled') },
  ]

  const visible = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">{t('appt_title')}</h1>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${filter === f.key ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map(a => (
          <div key={a.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{a.customer_name}</p>
                <p className="text-sm text-stone-500">{a.customer_phone}</p>
                <p className="text-sm text-stone-600 mt-1">{a.service_name} · {a.barber_name}</p>
                <p className="text-sm text-stone-500">{a.appointment_date} {a.appointment_time}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={a.status} t={t} />
                <div className="flex gap-2">
                  {a.status === 'pending' && (
                    <>
                      <ActionBtn onClick={() => updateStatus(a.id, 'confirmed')} label={t('appt_confirm_btn')} color="green" />
                      <ActionBtn onClick={() => updateStatus(a.id, 'cancelled')} label={t('appt_cancel_btn')} color="red" />
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <>
                      <ActionBtn onClick={() => updateStatus(a.id, 'completed')} label={t('appt_complete_btn')} color="blue" />
                      <ActionBtn onClick={() => updateStatus(a.id, 'cancelled')} label={t('appt_cancel_btn')} color="red" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status, t }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labels = {
    pending: t('appt_filter_pending'),
    confirmed: t('appt_filter_confirmed'),
    completed: t('appt_filter_completed'),
    cancelled: t('appt_filter_cancelled'),
  }
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${map[status] || 'bg-stone-100 text-stone-600'}`}>
      {labels[status] || status}
    </span>
  )
}

function ActionBtn({ onClick, label, color }) {
  const colors = {
    green: 'border-green-200 text-green-700 hover:bg-green-50',
    red: 'border-red-200 text-red-700 hover:bg-red-50',
    blue: 'border-blue-200 text-blue-700 hover:bg-blue-50',
  }
  return (
    <button onClick={onClick} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${colors[color]}`}>
      {label}
    </button>
  )
}