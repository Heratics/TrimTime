import React, { useEffect, useState } from 'react'
import {
  getShopHours,
  createShopHours,
  deleteShopHours,
  fetchBarbers,
  listBarberSchedule,
  createBarberSchedule,
  deleteBarberSchedule,
  listBarberBreaks,
  createBarberBreak,
  updateBarberBreak,
  deleteBarberBreak,
  listBarberTimeOff,
  createBarberTimeOff,
  updateBarberTimeOff,
  deleteBarberTimeOff,
} from '../../services/ownerService'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function Scheduling(){
  const [shopHours, setShopHours] = useState([])
  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [breaks, setBreaks] = useState([])
  const [timeOffs, setTimeOffs] = useState([])
  const [activeTab, setActiveTab] = useState('schedules')
  const [newHour, setNewHour] = useState({ day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false })
  const [newSchedule, setNewSchedule] = useState({ day_of_week: 1, start_time: '09:00', end_time: '17:00', is_working: true })
  const [breakForm, setBreakForm] = useState(emptyBreakForm())
  const [timeOffForm, setTimeOffForm] = useState(emptyTimeOffForm())
  const [editingBreakId, setEditingBreakId] = useState(null)
  const [editingTimeOffId, setEditingTimeOffId] = useState(null)

  useEffect(()=>{ loadInitial() },[])

  async function loadInitial(){
    const [shopHoursResponse, barbersResponse] = await Promise.all([
      getShopHours(),
      fetchBarbers(),
    ])

    console.log('SHOP HOURS API RESPONSE:', shopHoursResponse)

    setShopHours(shopHoursResponse.hours || [])
    setBarbers(barbersResponse.barbers || [])
  }

  async function refreshShopHours(){
    const response = await getShopHours()
    setShopHours(response.hours || [])
  }

  async function refreshBarberData(barberId){
    const [scheduleResponse, breaksResponse, timeOffResponse] = await Promise.all([
      listBarberSchedule(barberId),
      listBarberBreaks(barberId),
      listBarberTimeOff(barberId),
    ])
    setSchedules(scheduleResponse.schedules || [])
    setBreaks(breaksResponse.breaks || [])
    setTimeOffs(timeOffResponse.timeOffs || [])
  }

  async function addShopHour(){
    await createShopHours({ ...newHour, day_of_week: Number(newHour.day_of_week) })
    await refreshShopHours()
  }

  async function removeShopHour(id){
    if (!window.confirm('Delete this shop hour?')) return
    await deleteShopHours(id)
    await refreshShopHours()
  }

  async function selectBarber(barber){
    setSelectedBarber(barber)
    setActiveTab('schedules')
    setBreakForm(emptyBreakForm())
    setTimeOffForm(emptyTimeOffForm())
    setEditingBreakId(null)
    setEditingTimeOffId(null)
    await refreshBarberData(barber.id)
  }

  async function addSchedule(){
    if (!selectedBarber) return
    await createBarberSchedule(selectedBarber.id, { ...newSchedule, day_of_week: Number(newSchedule.day_of_week) })
    await refreshBarberData(selectedBarber.id)
  }

  async function removeSchedule(id){
    if (!selectedBarber) return
    if (!window.confirm('Delete this schedule?')) return
    await deleteBarberSchedule(selectedBarber.id, id)
    await refreshBarberData(selectedBarber.id)
  }

  async function submitBreak(e){
    e.preventDefault()
    if (!selectedBarber) return
    const payload = { ...breakForm, day_of_week: Number(breakForm.day_of_week) }
    if (editingBreakId) {
      await updateBarberBreak(selectedBarber.id, editingBreakId, payload)
    } else {
      await createBarberBreak(selectedBarber.id, payload)
    }
    await refreshBarberData(selectedBarber.id)
    setBreakForm(emptyBreakForm())
    setEditingBreakId(null)
  }

  async function submitTimeOff(e){
    e.preventDefault()
    if (!selectedBarber) return
    const payload = {
      start_date: timeOffForm.start_date,
      end_date: timeOffForm.end_date,
      reason: buildTimeOffReason(timeOffForm.type, timeOffForm.notes),
    }
    if (editingTimeOffId) {
      await updateBarberTimeOff(selectedBarber.id, editingTimeOffId, payload)
    } else {
      await createBarberTimeOff(selectedBarber.id, payload)
    }
    await refreshBarberData(selectedBarber.id)
    setTimeOffForm(emptyTimeOffForm())
    setEditingTimeOffId(null)
  }

  async function editBreak(item){
    setActiveTab('breaks')
    setEditingBreakId(item.id)
    setBreakForm({
      day_of_week: item.day_of_week,
      break_start: item.break_start,
      break_end: item.break_end,
      reason: item.reason || '',
    })
  }

  async function deleteBreak(itemId){
    if (!selectedBarber) return
    if (!window.confirm('Delete this break?')) return
    await deleteBarberBreak(selectedBarber.id, itemId)
    await refreshBarberData(selectedBarber.id)
  }

  async function editTimeOff(item){
    setActiveTab('timeoff')
    setEditingTimeOffId(item.id)
    const parsed = parseTimeOffReason(item.reason)
    setTimeOffForm({
      start_date: toDateValue(item.start_date),
      end_date: toDateValue(item.end_date),
      type: parsed.type,
      notes: parsed.notes,
    })
  }

  async function deleteTimeOff(itemId){
    if (!selectedBarber) return
    if (!window.confirm('Delete this time off entry?')) return
    await deleteBarberTimeOff(selectedBarber.id, itemId)
    await refreshBarberData(selectedBarber.id)
  }

  console.log('CURRENT shopHours STATE:', shopHours)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Scheduling</h1>
        <p className="text-sm text-gray-600">Manage shop hours, barber schedules, breaks, and time off from a single responsive screen.</p>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Shop Hours</h2>
            <p className="text-sm text-gray-500">Weekly open and close times.</p>
          </div>
        </div>

        <div className="space-y-2">
          {shopHours.map(hour => (
            <div key={hour.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium">
                <p>
                  {DAYS[hour.day_of_week]}: {hour.open_time} - {hour.close_time}
                </p>
              </div>
              <button className="self-start rounded-lg bg-red-500 px-3 py-2 text-sm text-white sm:self-auto" onClick={()=>removeShopHour(hour.id)}>
                Delete
              </button>
            </div>
          ))}
          {shopHours.length === 0 && <EmptyState title="No shop hours yet" text="Add the weekly business hours for this shop." />}
        </div>

        <div className="mt-4 rounded-xl border bg-gray-50 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Day of week">
              <select
                value={newHour.day_of_week}
                onChange={e=>setNewHour({...newHour, day_of_week:e.target.value})}
                className="w-full rounded-lg border px-3 py-2"
              >
                {DAYS.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Open time">
              <input value={newHour.open_time} onChange={e=>setNewHour({...newHour, open_time:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
            </Field>
            <Field label="Close time">
              <input value={newHour.close_time} onChange={e=>setNewHour({...newHour, close_time:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
            </Field>
            <div className="flex items-end">
              <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white" onClick={addShopHour} type="button">
                Add Shop Hour
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Barber Scheduling</h2>
            <p className="text-sm text-gray-500">Select a barber to manage working blocks, breaks, and leave.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Barbers</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {barbers.map(barber => (
                <button
                  key={barber.id}
                  onClick={()=>selectBarber(barber)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${selectedBarber?.id === barber.id ? 'border-green-600 bg-green-50' : 'bg-white hover:bg-gray-50'}`}
                  type="button"
                >
                  <div>
                    <div className="font-medium">{barber.full_name}</div>
                    <div className="text-xs text-gray-500">{barber.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                  <span className="text-sm text-gray-400">Manage</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedBarber ? (
              <div className="rounded-2xl border bg-gray-50 p-3 sm:p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedBarber.full_name}</h3>
                    <p className="text-sm text-gray-600">Use the tabs below to manage schedules, breaks, and time off.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TabButton active={activeTab === 'schedules'} onClick={()=>setActiveTab('schedules')}>Schedules</TabButton>
                    <TabButton active={activeTab === 'breaks'} onClick={()=>setActiveTab('breaks')}>Breaks</TabButton>
                    <TabButton active={activeTab === 'timeoff'} onClick={()=>setActiveTab('timeoff')}>Time Off</TabButton>
                  </div>
                </div>

                {activeTab === 'schedules' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {schedules.map(schedule => (
                        <div key={schedule.id} className="flex flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm font-medium">
                            {DAYS[schedule.day_of_week]}: {schedule.start_time} - {schedule.end_time}
                          </div>
                          <button className="self-start rounded-lg bg-red-500 px-3 py-2 text-sm text-white sm:self-auto" onClick={()=>removeSchedule(schedule.id)} type="button">
                            Delete
                          </button>
                        </div>
                      ))}
                      {schedules.length === 0 && <EmptyState title="No schedules yet" text="Add the barber's regular working hours." />}
                    </div>

                    <div className="rounded-xl border bg-white p-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        <Field label="Day">
                          <select
                            value={newSchedule.day_of_week}
                            onChange={e=>setNewSchedule({...newSchedule, day_of_week:e.target.value})}
                            className="w-full rounded-lg border px-3 py-2"
                          >
                            {DAYS.map((day, index) => (
                              <option key={index} value={index}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Start">
                          <input value={newSchedule.start_time} onChange={e=>setNewSchedule({...newSchedule, start_time:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
                        </Field>
                        <Field label="End">
                          <input value={newSchedule.end_time} onChange={e=>setNewSchedule({...newSchedule, end_time:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
                        </Field>
                        <div className="flex items-end">
                          <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white" onClick={addSchedule} type="button">
                            Add Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'breaks' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {breaks.map(item => (
                        <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              {DAYS[item.day_of_week]}: {item.break_start} - {item.break_end}
                            </div>
                            <div className="text-xs text-gray-500">{item.reason || 'No reason provided'}</div>
                          </div>
                          <div className="flex gap-2 self-start sm:self-auto">
                            <button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>editBreak(item)} type="button">Edit</button>
                            <button className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white" onClick={()=>deleteBreak(item.id)} type="button">Delete</button>
                          </div>
                        </div>
                      ))}
                      {breaks.length === 0 && <EmptyState title="No breaks yet" text="Add recurring break windows for this barber." />}
                    </div>

                    <form onSubmit={submitBreak} className="rounded-xl border bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h4 className="font-semibold">{editingBreakId ? 'Edit Break' : 'Add Break'}</h4>
                        {editingBreakId && (
                          <button
                            type="button"
                            className="text-sm text-gray-500"
                            onClick={()=>{ setEditingBreakId(null); setBreakForm(emptyBreakForm()) }}
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <Field label="Day of week">
                          <select
                            value={breakForm.day_of_week}
                            onChange={e=>setBreakForm({...breakForm, day_of_week:e.target.value})}
                            className="w-full rounded-lg border px-3 py-2"
                          >
                            {DAYS.map((day, index) => (
                              <option key={index} value={index}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Start time">
                          <input value={breakForm.break_start} onChange={e=>setBreakForm({...breakForm, break_start:e.target.value})} className="w-full rounded-lg border px-3 py-2" placeholder="12:00" />
                        </Field>
                        <Field label="End time">
                          <input value={breakForm.break_end} onChange={e=>setBreakForm({...breakForm, break_end:e.target.value})} className="w-full rounded-lg border px-3 py-2" placeholder="12:30" />
                        </Field>
                        <Field label="Reason">
                          <input value={breakForm.reason} onChange={e=>setBreakForm({...breakForm, reason:e.target.value})} className="w-full rounded-lg border px-3 py-2" placeholder="Lunch break" />
                        </Field>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white" type="submit">
                          {editingBreakId ? 'Update Break' : 'Add Break'}
                        </button>
                        <button className="rounded-lg border px-4 py-2.5" type="button" onClick={()=>{ setEditingBreakId(null); setBreakForm(emptyBreakForm()) }}>
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'timeoff' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {timeOffs.map(item => {
                        const parsed = parseTimeOffReason(item.reason)
                        return (
                          <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-sm font-medium">{toDateValue(item.start_date)} to {toDateValue(item.end_date)}</div>
                              <div className="text-xs text-gray-500">{parsed.type}{parsed.notes ? ` - ${parsed.notes}` : ''}</div>
                            </div>
                            <div className="flex gap-2 self-start sm:self-auto">
                              <button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>editTimeOff(item)} type="button">Edit</button>
                              <button className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white" onClick={()=>deleteTimeOff(item.id)} type="button">Delete</button>
                            </div>
                          </div>
                        )
                      })}
                      {timeOffs.length === 0 && <EmptyState title="No time off yet" text="Add leave periods for this barber." />}
                    </div>

                    <form onSubmit={submitTimeOff} className="rounded-xl border bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h4 className="font-semibold">{editingTimeOffId ? 'Edit Time Off' : 'Add Time Off'}</h4>
                        {editingTimeOffId && (
                          <button
                            type="button"
                            className="text-sm text-gray-500"
                            onClick={()=>{ setEditingTimeOffId(null); setTimeOffForm(emptyTimeOffForm()) }}
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <Field label="Start date">
                          <input type="date" value={timeOffForm.start_date} onChange={e=>setTimeOffForm({...timeOffForm, start_date:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
                        </Field>
                        <Field label="End date">
                          <input type="date" value={timeOffForm.end_date} onChange={e=>setTimeOffForm({...timeOffForm, end_date:e.target.value})} className="w-full rounded-lg border px-3 py-2" />
                        </Field>
                        <Field label="Type">
                          <select value={timeOffForm.type} onChange={e=>setTimeOffForm({...timeOffForm, type:e.target.value})} className="w-full rounded-lg border px-3 py-2">
                            <option>Vacation</option>
                            <option>Sick Leave</option>
                            <option>Personal Leave</option>
                          </select>
                        </Field>
                        <Field label="Notes">
                          <input value={timeOffForm.notes} onChange={e=>setTimeOffForm({...timeOffForm, notes:e.target.value})} className="w-full rounded-lg border px-3 py-2" placeholder="Optional details" />
                        </Field>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white" type="submit">
                          {editingTimeOffId ? 'Update Time Off' : 'Add Time Off'}
                        </button>
                        <button className="rounded-lg border px-4 py-2.5" type="button" onClick={()=>{ setEditingTimeOffId(null); setTimeOffForm(emptyTimeOffForm()) }}>
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border bg-white p-5 text-sm text-gray-600">Select a barber to manage schedules, breaks, and time off.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }){
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function TabButton({ active, onClick, children }){
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-gray-900 text-white' : 'border bg-white text-gray-700 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}

function EmptyState({ title, text }){
  return (
    <div className="rounded-xl border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
      <div className="font-medium text-gray-800">{title}</div>
      <div className="mt-1">{text}</div>
    </div>
  )
}

function emptyBreakForm(){
  return { day_of_week: 1, break_start: '12:00', break_end: '12:30', reason: '' }
}

function emptyTimeOffForm(){
  return { start_date: '', end_date: '', type: 'Vacation', notes: '' }
}

function buildTimeOffReason(type, notes){
  const safeNotes = (notes || '').trim()
  return safeNotes ? `${type}: ${safeNotes}` : type
}

function parseTimeOffReason(reason){
  if (!reason) return { type: 'Vacation', notes: '' }
  const [type, ...rest] = String(reason).split(':')
  return { type: (type || 'Vacation').trim(), notes: rest.join(':').trim() }
}

function toDateValue(value){
  if (!value) return ''
  return String(value).slice(0, 10)
}
