const appointmentsService = require('../services/appointmentsService');
const barberService = require('../services/barberService');
const barberScheduleService = require('../services/barberScheduleService');
const barberBreakService = require('../services/barberBreakService');
const barberTimeOffService = require('../services/barberTimeOffService');

async function getCurrentBarber(userId) {
  return barberService.getByUserId(userId);
}

function getLocalDateValue(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateValue(value) {
  return value instanceof Date ? getLocalDateValue(value) : String(value).slice(0, 10);
}

async function getDashboard(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });

    const appointments = await appointmentsService.getByBarberId(barber.id);
    const today = getLocalDateValue();
    const todaysAppointments = appointments.filter(appointment => {
      return getDateValue(appointment.appointment_date) === today;
    });

    res.json({
      barber,
      total_appointments: appointments.length,
      today_appointments: todaysAppointments.length,
      pending_appointments: appointments.filter(appointment => appointment.status === 'pending').length,
      confirmed_appointments: appointments.filter(appointment => appointment.status === 'confirmed').length,
      completed_appointments: appointments.filter(appointment => appointment.status === 'completed').length,
      upcoming_appointments: appointments.filter(appointment => {
        return appointment.status !== 'cancelled' &&
          getDateValue(appointment.appointment_date) >= today;
      }).length,
    });
  } catch (err) {
    next(err);
  }
}

async function getSchedule(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });

    const [schedules, breaks, timeOffs] = await Promise.all([
      barberScheduleService.getBarberScheduleByBarberId(barber.id),
      barberBreakService.getBarberBreaksByBarberId(barber.id),
      barberTimeOffService.getBarberTimeOffByBarberId(barber.id),
    ]);

    res.json({ barber, schedules, breaks, timeOffs });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });

    const { full_name, bio, profile_image_url } = req.body;
    const updated = await barberService.updateById(barber.id, { full_name, bio, profile_image_url });
    res.json({ barber: updated });
  } catch (err) {
    next(err);
  }
}

async function addSchedule(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    const schedule = await barberScheduleService.createBarberSchedule(barber.id, req.body);
    res.status(201).json({ schedule });
  } catch (err) { next(err); }
}

async function deleteSchedule(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    await barberScheduleService.deleteBarberScheduleById(Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

async function addBreak(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    const item = await barberBreakService.createBarberBreak(barber.id, req.body);
    res.status(201).json({ break: item });
  } catch (err) { next(err); }
}

async function deleteBreak(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    await barberBreakService.deleteBarberBreakById(Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

async function addTimeOff(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    const item = await barberTimeOffService.createBarberTimeOff(barber.id, req.body);
    res.status(201).json({ timeOff: item });
  } catch (err) { next(err); }
}

async function deleteTimeOff(req, res, next) {
  try {
    const barber = await getCurrentBarber(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    await barberTimeOffService.deleteBarberTimeOffById(Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getSchedule, updateProfile, addSchedule, deleteSchedule, addBreak, deleteBreak, addTimeOff, deleteTimeOff };