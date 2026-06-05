const shopService = require('./shopService');
const shopHoursService = require('./shopHoursService');
const barberService = require('./barberService');
const barberScheduleService = require('./barberScheduleService');
const barberBreakService = require('./barberBreakService');
const barberTimeOffService = require('./barberTimeOffService');
const servicesService = require('./servicesService');
const appointmentsService = require('./appointmentsService');

function timeToMinutes(t) {
  // t = 'HH:MM' or 'HH:MM:SS'
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTime(m) {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

class AvailabilityService {
  // Returns array of time strings e.g. ['09:00','09:45']
  async getAvailableSlots({ barberId, serviceId, date }) {
    // Validate existence
    const service = await servicesService.getById(serviceId);
    if (!service) throw { status: 404, message: 'Service not found' };
    if (!service.is_active) throw { status: 400, message: 'Service is not active' };

    const barber = await barberService.getById(barberId);
    if (!barber) throw { status: 404, message: 'Barber not found' };

    const shop = await shopService.getById(barber.shop_id);
    if (!shop) throw { status: 404, message: 'Shop not found' };

    // Day of week: 0 = Sunday ... 6 = Saturday (JS)
    const dt = new Date(date + 'T00:00:00');
    if (isNaN(dt.getTime())) throw { status: 400, message: 'Invalid date' };
    const dayOfWeek = dt.getDay();

    // 1) Shop must be open that day
    const shopHours = await shopHoursService.getShopHoursByShopId(shop.id);
    const dayShopHours = shopHours.find(h => h.day_of_week === dayOfWeek);
    if (!dayShopHours || dayShopHours.is_closed) {
      throw { status: 400, message: 'Shop is closed on this date' };
    }

    // 2) Barber must be scheduled
    const barberSchedules = await barberScheduleService.getBarberScheduleByBarberId(barberId);
    const workingSchedules = barberSchedules.filter(s => s.day_of_week === dayOfWeek && s.is_working);
    if (!workingSchedules || workingSchedules.length === 0) {
      throw { status: 400, message: 'Barber has no working schedule for this date' };
    }

    // 3) Barber must not be on time off
    const timeOff = await barberTimeOffService.getBarberTimeOffByBarberId(barberId);
    const onTimeOff = timeOff.find(t => {
      const start = new Date(t.start_date);
      const end = new Date(t.end_date);
      return dt >= start && dt <= end;
    });
    if (onTimeOff) throw { status: 400, message: 'Barber is on time off for this date' };

    // 4) Get breaks for the day
    const breaks = (await barberBreakService.getBarberBreaksByBarberId(barberId))
      .filter(b => b.day_of_week === dayOfWeek)
      .map(b => ({ start: timeToMinutes(b.break_start), end: timeToMinutes(b.break_end) }));

    // 5) Get existing appointments for the barber on that date — only blocking statuses
    const duration = Number(service.duration_minutes);
    if (!duration || duration <= 0) throw { status: 400, message: 'Invalid service duration' };

    const blockingStatuses = ['pending', 'confirmed'];
    const appointments = (await appointmentsService.getByBarberAndDate(barberId, date, blockingStatuses) || [])
      .map(a => {
        // appointment_time is TIME like '09:45'; service_duration stored in `service_duration` (fallback to service.duration_minutes)
        const apDuration = Number(a.service_duration) || duration;
        return { start: timeToMinutes(a.appointment_time), end: timeToMinutes(a.appointment_time) + apDuration };
      });

    const slots = [];

    // For each working schedule segment (allows split shifts)
    for (const sched of workingSchedules) {
      let segmentStart = Math.max(timeToMinutes(sched.start_time), timeToMinutes(dayShopHours.open_time));
      const segmentEnd = Math.min(timeToMinutes(sched.end_time), timeToMinutes(dayShopHours.close_time));

      // If schedule outside shop hours or no overlap
      if (segmentStart >= segmentEnd) continue;

      // Generate slots starting at segmentStart, step by service duration
      let cursor = segmentStart;
      while (cursor + duration <= segmentEnd) {
        const slotStart = cursor;
        const slotEnd = cursor + duration;

        // 4) Slot cannot overlap breaks
        const overlapsBreak = breaks.some(br => rangesOverlap(slotStart, slotEnd, br.start, br.end));
        // Slot cannot overlap existing appointments
        const overlapsAppointment = appointments.some(ap => rangesOverlap(slotStart, slotEnd, ap.start, ap.end));
        if (!overlapsBreak) {
          if (!overlapsAppointment) {
          slots.push(minutesToTime(slotStart));
          }
        }

        // step by duration_minutes to avoid fractional overlapping patterns
        cursor += duration;
      }
    }

    // Deduplicate sorted slots
    const unique = Array.from(new Set(slots)).sort();
    return unique;
  }
}

module.exports = new AvailabilityService();
