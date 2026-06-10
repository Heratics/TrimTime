import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerScheduling() {
  const { t } = useLanguage()
  const [barbers, setBarbers] = useState([])
  const [shopHours, setShopHours] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [tab, setTab] = useState('schedules')
  const [schedules, setSchedules] = useState([])
  const [breaks, setBreaks] = useState([])
  const [timeoffs, setTimeoffs] = useState([])
  const [newHour, setNewHour] = useState({ day_of_week: '0', open_time: '', close_time: '' })
  const [newSchedule, setNewSchedule] = useState({ day_of_week: '0', start_time: '', end_time: '' })
  const [breakForm, setBreakForm] = useState({ day_of_week: '0', start_time: '', end_time: '', reason: '' })
  const [editingBreak, setEditingBreak] = useState(null)
  const [timeoffForm, setTimeoffForm] = useState({ start_date: '', end_date: '', type: 'vacation', notes: '' })
  const [editingTimeoff, setEditingTimeoff] = useState(null)
  const [error, setError] = useState('')

  const days = [t('days_0'), t('days_1'), t('days_2'), t('days_3'), t('days_4'), t('days_5'), t('days_6')]

  const timeoffTypes = [
    { value: 'vacation', label: t('sched_vacation') },
    { value: 'sick_leave', label: t('sched_sick_leave') },
    { value: 'personal_leave', label: t('sched_personal_leave') },
  ]

  useEffect(() => {
    loadBarbers()
    loadShopHours()
  }, [])

  useEffect(() => {
    if (selectedBarber) {
      loadSchedules()
      loadBreaks()
      loadTimeoffs()
    }
  }, [selectedBarber])

  async function loadBarbers() {
    try {
      const res = await api.get('/barbers/shop')
      setBarbers(res.data.barbers || [])
    } catch {}
  }

  async function loadShopHours() {
    try {
      const res = await api.get('/shop-hours')
      setShopHours(res.data.hours || [])
    } catch {}
  }

  async function loadSchedules() {
    try {
      const res = await api.get(`/barbers/${selectedBarber.id}/schedule`)
      setSchedules(res.data.schedules || [])
    } catch {}
  }

  async function loadBreaks() {
    try {
      const res = await api.get(`/barbers/${selectedBarber.id}/breaks`)
      setBreaks(res.data.breaks || [])
    } catch {}
  }

  async function loadTimeoffs() {
    try {
      const res = await api.get(`/barbers/${selectedBarber.id}/time-off`)
      setTimeoffs(res.data.timeoff || [])
    } catch {}
  }

  async function addShopHour() {
    try {
      await api.post('/shop-hours', newHour)
      setNewHour({ day_of_week: '0', open_time: '', close_time: '' })
      loadShopHours()
    } catch { setError(t('sched_err_save')) }
  }

  async function deleteShopHour(id) {
    if (!window.confirm(t('sched_confirm_delete_hour'))) return
    try { await api.delete(`/shop-hours/${id}`); loadShopHours() } catch { setError(t('sched_err_save')) }
  }

  async function addSchedule() {
    try {
      await api.post(`/barbers/${selectedBarber.id}/schedule`, newSchedule)
      setNewSchedule({ day_of_week: '0', start_time: '', end_time: '' })
      loadSchedules()
    } catch { setError(t('sched_err_save')) }
  }

  async function deleteSchedule(id) {
    if (!window.confirm(t('sched_confirm_delete_schedule'))) return
    try { await api.delete(`/barbers/${selectedBarber.id}/schedule/${id}`); loadSchedules() } catch { setError(t('sched_err_save')) }
  }

  async function saveBreak() {
    try {
      if (editingBreak) {
        await api.put(`/barbers/${selectedBarber.id}/breaks/${editingBreak.id}`, breakForm)
        setEditingBreak(null)
      } else {
        await api.post(`/barbers/${selectedBarber.id}/breaks`, breakForm)
      }
      setBreakForm({ day_of_week: '0', start_time: '', end_time: '', reason: '' })
      loadBreaks()
    } catch { setError(t('sched_err_save')) }
  }

  async function deleteBreak(id) {
    if (!window.confirm(t('sched_confirm_delete_break'))) return
    try { await api.delete(`/barbers/${selectedBarber.id}/breaks/${id}`); loadBreaks() } catch { setError(t('sched_err_save')) }
  }

  async function saveTimeoff() {
    try {
      if (editingTimeoff) {
        await api.put(`/barbers/${selectedBarber.id}/time-off/${editingTimeoff.id}`, timeoffForm)
        setEditingTimeoff(null)
      } else {
        await api.post(`/barbers/${selectedBarber.id}/time-off`, timeoffForm)
      }
      setTimeoffForm({ start_date: '', end_date: '', type: 'vacation', notes: '' })
      loadTimeoffs()
    } catch { setError(t('sched_err_save')) }
  }

  async function deleteTimeoff(id) {
    if (!window.confirm(t('sched_confirm_delete_timeoff'))) return
    try { await api.delete(`/barbers/${selectedBarber.id}/time-off/${id}`); loadTimeoffs() } catch { setError(t('sched_err_save')) }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">{t('sched_title')}</h1>
        <p className="text-stone-500 text-sm">{t('sched_sub')}</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Shop Hours */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-black">{t('sched_shop_hours_title')}</h2>
          <p className="text-sm text-stone-500">{t('sched_shop_hours_sub')}</p>
        </div>
        {shopHours.length === 0
          ? <Empty title={t('sched_no_shop_hours')} sub={t('sched_no_shop_hours_sub')} />
          : (
            <div className="space-y-2">
              {shopHours.map(h => (
                <div key={h.id} className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm">
                  <span className="font-semibold">{days[h.day_of_week]}</span>
                  <span className="text-stone-500">{h.open_time?.slice(0, 5)} – {h.close_time?.slice(0, 5)}</span>
                  <button onClick={() => deleteShopHour(h.id)} className="text-red-500 text-xs font-semibold hover:underline">{t('sched_delete')}</button>
                </div>
              ))}
            </div>
          )
        }
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select value={newHour.day_of_week} onChange={e => setNewHour({ ...newHour, day_of_week: e.target.value })} className="rounded-xl border px-3 py-2 text-sm bg-white">
            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input type="time" value={newHour.open_time} onChange={e => setNewHour({ ...newHour, open_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" placeholder={t('sched_open_time')} />
          <input type="time" value={newHour.close_time} onChange={e => setNewHour({ ...newHour, close_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" placeholder={t('sched_close_time')} />
          <button onClick={addShopHour} className="rounded-xl bg-stone-900 px-3 py-2 text-sm font-bold text-white">{t('sched_add_shop_hour')}</button>
        </div>
      </section>

      {/* Barber Scheduling */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-black">{t('sched_barber_title')}</h2>
          <p className="text-sm text-stone-500">{t('sched_barber_sub')}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-600 mb-2">{t('sched_barbers_label')}</p>
          <div className="flex flex-wrap gap-2">
            {barbers.map(b => (
              <button
                key={b.id}
                onClick={() => { setSelectedBarber(b); setTab('schedules') }}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${selectedBarber?.id === b.id ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}
              >
                {b.full_name}
              </button>
            ))}
          </div>
        </div>

        {!selectedBarber
          ? <p className="text-sm text-stone-400 italic">{t('sched_select_barber_prompt')}</p>
          : (
            <div className="space-y-4">
              <p className="text-sm text-stone-500">{t('sched_use_tabs')}</p>
              <div className="flex gap-2 border-b">
                {[
                  { key: 'schedules', label: t('sched_tab_schedules') },
                  { key: 'breaks', label: t('sched_tab_breaks') },
                  { key: 'timeoff', label: t('sched_tab_timeoff') },
                ].map(tb => (
                  <button
                    key={tb.key}
                    onClick={() => setTab(tb.key)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === tb.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Schedules tab */}
              {tab === 'schedules' && (
                <div className="space-y-3">
                  {schedules.length === 0
                    ? <Empty title={t('sched_no_schedules')} sub={t('sched_no_schedules_sub')} />
                    : schedules.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm">
                        <span className="font-semibold">{days[s.day_of_week]}</span>
                        <span className="text-stone-500">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                        <button onClick={() => deleteSchedule(s.id)} className="text-red-500 text-xs font-semibold hover:underline">{t('sched_delete')}</button>
                      </div>
                    ))
                  }
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <select value={newSchedule.day_of_week} onChange={e => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })} className="rounded-xl border px-3 py-2 text-sm bg-white">
                      {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                    <input type="time" value={newSchedule.start_time} onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <input type="time" value={newSchedule.end_time} onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <button onClick={addSchedule} className="rounded-xl bg-stone-900 px-3 py-2 text-sm font-bold text-white">{t('sched_add_schedule')}</button>
                  </div>
                </div>
              )}

              {/* Breaks tab */}
              {tab === 'breaks' && (
                <div className="space-y-3">
                  {breaks.length === 0
                    ? <Empty title={t('sched_no_breaks')} sub={t('sched_no_breaks_sub')} />
                    : breaks.map(b => (
                      <div key={b.id} className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm">
                        <span className="font-semibold">{days[b.day_of_week]}</span>
                        <span className="text-stone-500">{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</span>
                        <span className="text-stone-400">{b.reason || ''}</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingBreak(b); setBreakForm({ day_of_week: b.day_of_week, start_time: b.start_time?.slice(0, 5), end_time: b.end_time?.slice(0, 5), reason: b.reason || '' }) }} className="text-xs font-semibold text-stone-500 hover:underline">{t('sched_edit_break')}</button>
                          <button onClick={() => deleteBreak(b.id)} className="text-red-500 text-xs font-semibold hover:underline">{t('sched_delete')}</button>
                        </div>
                      </div>
                    ))
                  }
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <select value={breakForm.day_of_week} onChange={e => setBreakForm({ ...breakForm, day_of_week: e.target.value })} className="rounded-xl border px-3 py-2 text-sm bg-white">
                      {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                    <input type="time" value={breakForm.start_time} onChange={e => setBreakForm({ ...breakForm, start_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <input type="time" value={breakForm.end_time} onChange={e => setBreakForm({ ...breakForm, end_time: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <input value={breakForm.reason} onChange={e => setBreakForm({ ...breakForm, reason: e.target.value })} placeholder={t('sched_reason')} className="rounded-xl border px-3 py-2 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveBreak} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">
                      {editingBreak ? t('sched_update_break') : t('sched_add_break')}
                    </button>
                    {editingBreak && (
                      <button onClick={() => { setEditingBreak(null); setBreakForm({ day_of_week: '0', start_time: '', end_time: '', reason: '' }) }} className="rounded-xl border px-4 py-2 text-sm font-bold">
                        {t('sched_clear')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Time Off tab */}
              {tab === 'timeoff' && (
                <div className="space-y-3">
                  {timeoffs.length === 0
                    ? <Empty title={t('sched_no_timeoff')} sub={t('sched_no_timeoff_sub')} />
                    : timeoffs.map(to => (
                      <div key={to.id} className="flex items-center justify-between rounded-xl border px-4 py-2 text-sm">
                        <span className="font-semibold">{to.start_date} – {to.end_date}</span>
                        <span className="text-stone-500">{timeoffTypes.find(x => x.value === to.type)?.label || to.type}</span>
                        <span className="text-stone-400">{to.notes || ''}</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingTimeoff(to); setTimeoffForm({ start_date: to.start_date, end_date: to.end_date, type: to.type, notes: to.notes || '' }) }} className="text-xs font-semibold text-stone-500 hover:underline">{t('sched_edit_timeoff')}</button>
                          <button onClick={() => deleteTimeoff(to.id)} className="text-red-500 text-xs font-semibold hover:underline">{t('sched_delete')}</button>
                        </div>
                      </div>
                    ))
                  }
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input type="date" value={timeoffForm.start_date} onChange={e => setTimeoffForm({ ...timeoffForm, start_date: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <input type="date" value={timeoffForm.end_date} onChange={e => setTimeoffForm({ ...timeoffForm, end_date: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                    <select value={timeoffForm.type} onChange={e => setTimeoffForm({ ...timeoffForm, type: e.target.value })} className="rounded-xl border px-3 py-2 text-sm bg-white">
                      {timeoffTypes.map(ty => <option key={ty.value} value={ty.value}>{ty.label}</option>)}
                    </select>
                    <input value={timeoffForm.notes} onChange={e => setTimeoffForm({ ...timeoffForm, notes: e.target.value })} placeholder={t('sched_notes_placeholder')} className="rounded-xl border px-3 py-2 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveTimeoff} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">
                      {editingTimeoff ? t('sched_update_timeoff') : t('sched_add_timeoff')}
                    </button>
                    {editingTimeoff && (
                      <button onClick={() => { setEditingTimeoff(null); setTimeoffForm({ start_date: '', end_date: '', type: 'vacation', notes: '' }) }} className="rounded-xl border px-4 py-2 text-sm font-bold">
                        {t('sched_clear')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        }
      </section>
    </div>
  )
}

function Empty({ title, sub }) {
  return (
    <div className="rounded-xl border border-dashed p-4 text-center">
      <p className="font-semibold text-stone-600">{title}</p>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}