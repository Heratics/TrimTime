const barberBreakService = require('../services/barberBreakService');
const barberService = require('../services/barberService');
const shopService = require('../services/shopService');
const barberScheduleService = require('../services/barberScheduleService');

function validateTimeRange(break_start, break_end) {
  if (break_start >= break_end) {
    return { valid: false, error: 'Break end time must be after break start time' };
  }
  return { valid: true };
}

function timeWithinRange(testStart, testEnd, rangeStart, rangeEnd) {
  return testStart >= rangeStart && testEnd <= rangeEnd;
}

async function createBarberBreak(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const { break_start, break_end, day_of_week } = req.body;
    const timeCheck = validateTimeRange(break_start, break_end);
    if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });

    // Validate break falls within barber's working schedule for this day
    const barberSchedules = await barberScheduleService.getBarberScheduleByBarberId(barberId);
    const daySchedule = barberSchedules.find(s => s.day_of_week === day_of_week && s.is_working);
    if (!daySchedule) return res.status(400).json({ error: 'Barber has no working schedule for this day' });

    if (!timeWithinRange(break_start, break_end, daySchedule.start_time, daySchedule.end_time)) {
      return res.status(400).json({ error: 'Break must fall within barber\'s working hours' });
    }

    // Check for overlapping breaks on same day
    const existing = await barberBreakService.getBarberBreaksByBarberId(barberId);
    const overlap = existing.find(b => {
      if (b.day_of_week !== day_of_week) return false;
      return (break_start < b.break_end && break_end > b.break_start);
    });
    if (overlap) return res.status(409).json({ error: 'Break overlaps with existing break' });

    const brk = await barberBreakService.createBarberBreak(barberId, req.body);
    res.status(201).json({ break: brk });
  } catch (err) {
    next(err);
  }
}

async function listBarberBreaks(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const breaks = await barberBreakService.getBarberBreaksByBarberId(barberId);
    res.json({ breaks });
  } catch (err) {
    next(err);
  }
}

async function updateBarberBreak(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const breakId = Number(req.params.breakId);
    const brk = await barberBreakService.getBarberBreakById(breakId);
    if (!brk) return res.status(404).json({ error: 'Break not found' });

    if (brk.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    if (req.body.break_start && req.body.break_end) {
      const timeCheck = validateTimeRange(req.body.break_start, req.body.break_end);
      if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });
    }

    // If updating day or time, check for overlaps and working hours
    if (req.body.break_start || req.body.break_end || req.body.day_of_week) {
      const break_start = req.body.break_start || brk.break_start;
      const break_end = req.body.break_end || brk.break_end;
      const day_of_week = req.body.day_of_week || brk.day_of_week;

      // Validate break falls within barber's working schedule for this day
      const barberSchedules = await barberScheduleService.getBarberScheduleByBarberId(barberId);
      const daySchedule = barberSchedules.find(s => s.day_of_week === day_of_week && s.is_working);
      if (!daySchedule) return res.status(400).json({ error: 'Barber has no working schedule for this day' });

      if (!timeWithinRange(break_start, break_end, daySchedule.start_time, daySchedule.end_time)) {
        return res.status(400).json({ error: 'Break must fall within barber\'s working hours' });
      }

      const existing = await barberBreakService.getBarberBreaksByBarberId(barberId);
      const overlap = existing.find(b => {
        if (b.id === breakId) return false; // Skip self
        if (b.day_of_week !== day_of_week) return false;
        return (break_start < b.break_end && break_end > b.break_start);
      });
      if (overlap) return res.status(409).json({ error: 'Break overlaps with existing break' });
    }

    const updated = await barberBreakService.updateBarberBreakById(breakId, req.body);
    res.json({ break: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteBarberBreak(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const breakId = Number(req.params.breakId);
    const brk = await barberBreakService.getBarberBreakById(breakId);
    if (!brk) return res.status(404).json({ error: 'Break not found' });

    if (brk.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    await barberBreakService.deleteBarberBreakById(breakId);
    res.json({ message: 'Break deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBarberBreak, listBarberBreaks, updateBarberBreak, deleteBarberBreak };
