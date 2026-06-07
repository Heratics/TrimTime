const barberScheduleService = require('../services/barberScheduleService');
const barberService = require('../services/barberService');
const shopService = require('../services/shopService');
const shopHoursService = require('../services/shopHoursService');

function validateTimeRange(start_time, end_time) {
  if (start_time >= end_time) {
    return { valid: false, error: 'End time must be after start time' };
  }
  return { valid: true };
}

function normalizeTime(t) {
  return t ? t.slice(0, 5) : t; // trims "09:00:00" → "09:00"
}

function timeWithinRange(testStart, testEnd, rangeStart, rangeEnd) {
  const s = normalizeTime(testStart);
  const e = normalizeTime(testEnd);
  const rs = normalizeTime(rangeStart);
  const re = normalizeTime(rangeEnd);
  // Handle overnight ranges e.g. 20:00 - 04:00
  if (re <= rs) {
    // Overnight: valid if start is after open OR end is before close (next day)
    return s >= rs || e <= re;
  }
  return s >= rs && e <= re;
}

function timesOverlap(start1, end1, start2, end2) {
  const s1 = normalizeTime(start1), e1 = normalizeTime(end1);
  const s2 = normalizeTime(start2), e2 = normalizeTime(end2);
  return s1 < e2 && e1 > s2;
}

async function createBarberSchedule(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const { day_of_week, start_time, end_time } = req.body;
    const timeCheck = validateTimeRange(start_time, end_time);
    if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });

    // Check barber schedule against shop hours for this day
    const shopHours = await shopHoursService.getShopHoursByShopId(shop.id);
    const dayHours = shopHours.find(
      h => Number(h.day_of_week) === Number(day_of_week)
      );  
    if (dayHours && !dayHours.is_closed) {
      if (!timeWithinRange(start_time, end_time, dayHours.open_time, dayHours.close_time)) {
        return res.status(400).json({ error: 'Barber schedule must fall within shop hours' });
      }
    }

    // Check for overlapping schedules on same day
    const existing = await barberScheduleService.getBarberScheduleByBarberId(barberId);
    const overlap = existing.find(s => {
      if (Number(s.day_of_week) !== Number(day_of_week)) return false;
      return timesOverlap(start_time, end_time, s.start_time, s.end_time);
    });
    if (overlap) return res.status(409).json({ error: 'Schedule overlaps with existing schedule' });

    const schedule = await barberScheduleService.createBarberSchedule(barberId, req.body);
    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
}

async function listBarberSchedule(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const schedules = await barberScheduleService.getBarberScheduleByBarberId(barberId);
    res.json({ schedules });
  } catch (err) {
    next(err);
  }
}

async function updateBarberSchedule(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const scheduleId = Number(req.params.scheduleId);
    const schedule = await barberScheduleService.getBarberScheduleById(scheduleId);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    if (schedule.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    if (req.body.start_time && req.body.end_time) {
      const timeCheck = validateTimeRange(req.body.start_time, req.body.end_time);
      if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });
    }

    // If updating day or times, validate against shop hours and overlaps
    if (req.body.day_of_week || req.body.start_time || req.body.end_time) {
      const day_of_week = req.body.day_of_week || schedule.day_of_week;
      const start_time = req.body.start_time || schedule.start_time;
      const end_time = req.body.end_time || schedule.end_time;

      // Check against shop hours
      const shopHours = await shopHoursService.getShopHoursByShopId(shop.id);
      const dayHours = shopHours.find(
        h => Number(h.day_of_week) === Number(day_of_week)
        );
      if (dayHours && !dayHours.is_closed) {
        if (!timeWithinRange(start_time, end_time, dayHours.open_time, dayHours.close_time)) {
          return res.status(400).json({ error: 'Barber schedule must fall within shop hours' });
        }
      }

      // Check for overlaps
      const existing = await barberScheduleService.getBarberScheduleByBarberId(barberId);
      const overlap = existing.find(s => {
        if (s.id === scheduleId) return false; // Skip self
        if (Number(s.day_of_week) !== Number(day_of_week)) return false;
        return timesOverlap(start_time, end_time, s.start_time, s.end_time);
      });
      if (overlap) return res.status(409).json({ error: 'Schedule overlaps with existing schedule' });
    }

    const updated = await barberScheduleService.updateBarberScheduleById(scheduleId, req.body);
    res.json({ schedule: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteBarberSchedule(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const scheduleId = Number(req.params.scheduleId);
    const schedule = await barberScheduleService.getBarberScheduleById(scheduleId);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    if (schedule.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    await barberScheduleService.deleteBarberScheduleById(scheduleId);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBarberSchedule, listBarberSchedule, updateBarberSchedule, deleteBarberSchedule };
