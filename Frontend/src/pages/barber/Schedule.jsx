import React, { useEffect, useState } from 'react'
import {
  fetchMySchedule,
  addMySchedule, deleteMySchedule,
  addMyBreak, deleteMyBreak,
  addMyTimeOff, deleteMyTimeOff
} from '../../services/barberService'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Schedule() {
  const [data, setData] = useState({ schedules: [], breaks: [], timeOffs: [] })
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetchMySchedule()
      setData(res)
    } catch {
      setError('Unable to load your schedule.')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">My Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your working hours, breaks, and time off.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <WorkingHours schedules={data.schedules} onRefresh={load} />
      <Breaks breaks={data.breaks} onRefresh={load} />
      <TimeOff timeOffs={data.timeOffs} onRefresh={load} />
    </div>
  )
}

function WorkingHours({ schedules, onRefresh }) {
  const [form, setForm] = useState({ day_of_week: '1', start_time: '09:00', end_time: '17:00' })
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [show, setShow] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await addMySchedule({ ...form, day_of_week: Number(form.day_of_week) })
      setShow(false)
      await onRefresh()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add.')
    } finally {
      setAdding(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this working hour?')) return
    try {
      await deleteMySchedule(id)
      await onRefresh()
    } catch {
      setError('Failed to delete.')
    }
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Working Hours</h2>
        <button onClick={() => setShow(s => !s)} className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
          {show ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {show && (
        <form onSubmit={submit} className="mb-4 rounded-xl border bg-stone-50 p-4 space-y-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Day</label>
            <select value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })} className="w-full rounded-lg border px-3 py-2">
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
          </div>
          <button type="submit" disabled={adding} className="w-full rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {adding ? 'Adding…' : 'Add Working Hours'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {schedules.length === 0
          ? <p className="text-sm text-gray-500">No working hours added yet.</p>
          : schedules.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div>
                <div className="font-medium">{DAY_NAMES[item.day_of_week]}</div>
                <div className="text-sm text-gray-600">{item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)}</div>
              </div>
              <button onClick={() => remove(item.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
            </div>
          ))
        }
      </div>
    </section>
  )
}

function Breaks({ breaks, onRefresh }) {
  const [form, setForm] = useState({ day_of_week: '1', break_start: '13:00', break_end: '14:00', reason: '' })
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [show, setShow] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await addMyBreak({ ...form, day_of_week: Number(form.day_of_week) })
      setShow(false)
      await onRefresh()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add.')
    } finally {
      setAdding(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this break?')) return
    try {
      await deleteMyBreak(id)
      await onRefresh()
    } catch {
      setError('Failed to delete.')
    }
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Breaks</h2>
        <button onClick={() => setShow(s => !s)} className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
          {show ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {show && (
        <form onSubmit={submit} className="mb-4 rounded-xl border bg-stone-50 p-4 space-y-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Day</label>
            <select value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })} className="w-full rounded-lg border px-3 py-2">
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input type="time" value={form.break_start} onChange={e => setForm({ ...form, break_start: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input type="time" value={form.break_end} onChange={e => setForm({ ...form, break_end: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full rounded-lg border px-3 py-2" placeholder="e.g. Lunch" />
          </div>
          <button type="submit" disabled={adding} className="w-full rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {adding ? 'Adding…' : 'Add Break'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {breaks.length === 0
          ? <p className="text-sm text-gray-500">No breaks added yet.</p>
          : breaks.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div>
                <div className="font-medium">{DAY_NAMES[item.day_of_week]}</div>
                <div className="text-sm text-gray-600">{item.break_start?.slice(0,5)} – {item.break_end?.slice(0,5)}{item.reason ? ` · ${item.reason}` : ''}</div>
              </div>
              <button onClick={() => remove(item.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
            </div>
          ))
        }
      </div>
    </section>
  )
}

function TimeOff({ timeOffs, onRefresh }) {
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' })
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [show, setShow] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await addMyTimeOff(form)
      setShow(false)
      await onRefresh()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add.')
    } finally {
      setAdding(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this time off?')) return
    try {
      await deleteMyTimeOff(id)
      await onRefresh()
    } catch {
      setError('Failed to delete.')
    }
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Time Off</h2>
        <button onClick={() => setShow(s => !s)} className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
          {show ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {show && (
        <form onSubmit={submit} className="mb-4 rounded-xl border bg-stone-50 p-4 space-y-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full rounded-lg border px-3 py-2" placeholder="e.g. Vacation" />
          </div>
          <button type="submit" disabled={adding} className="w-full rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {adding ? 'Adding…' : 'Add Time Off'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {timeOffs.length === 0
          ? <p className="text-sm text-gray-500">No time off added yet.</p>
          : timeOffs.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div>
                <div className="font-medium">{String(item.start_date).slice(0,10)} → {String(item.end_date).slice(0,10)}</div>
                <div className="text-sm text-gray-600">{item.reason || 'No reason provided'}</div>
              </div>
              <button onClick={() => remove(item.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
            </div>
          ))
        }
      </div>
    </section>
  )
}