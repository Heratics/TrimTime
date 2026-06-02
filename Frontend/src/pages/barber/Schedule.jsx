import React, { useEffect, useState } from 'react'
import { fetchMySchedule } from '../../services/barberService'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Schedule(){
  const [data, setData] = useState({ schedules: [], breaks: [], timeOffs: [] })
  const [error, setError] = useState('')

  useEffect(()=>{
    fetchMySchedule().then(setData).catch(()=>setError('Unable to load your schedule.'))
  },[])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">My Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">Your weekly working hours, breaks, and approved time off.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <ScheduleSection title="Working Hours" emptyText="No working hours have been added yet.">
        {data.schedules.map(item=>(
          <ScheduleRow key={item.id} title={dayNames[item.day_of_week] || `Day ${item.day_of_week}`} text={item.is_working ? `${item.start_time} - ${item.end_time}` : 'Not working'} />
        ))}
      </ScheduleSection>

      <ScheduleSection title="Breaks" emptyText="No recurring breaks have been added yet.">
        {data.breaks.map(item=>(
          <ScheduleRow key={item.id} title={dayNames[item.day_of_week] || `Day ${item.day_of_week}`} text={`${item.break_start} - ${item.break_end}${item.reason ? ` - ${item.reason}` : ''}`} />
        ))}
      </ScheduleSection>

      <ScheduleSection title="Time Off" emptyText="No time off has been added yet.">
        {data.timeOffs.map(item=>(
          <ScheduleRow key={item.id} title={`${toDateValue(item.start_date)} to ${toDateValue(item.end_date)}`} text={item.reason || 'No reason provided'} />
        ))}
      </ScheduleSection>
    </div>
  )
}

function ScheduleSection({ title, emptyText, children }){
  const items = React.Children.toArray(children)
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-2">
        {items.length > 0 ? items : <div className="text-sm text-gray-500">{emptyText}</div>}
      </div>
    </section>
  )
}

function ScheduleRow({ title, text }){
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{text}</div>
    </div>
  )
}

function toDateValue(value){
  return value ? String(value).slice(0, 10) : ''
}
