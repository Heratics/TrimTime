const barberTimeOffService = require('../services/barberTimeOffService');
const barberService = require('../services/barberService');
const shopService = require('../services/shopService');

function validateDateRange(start_date, end_date) {
  if (start_date >= end_date) {
    return { valid: false, error: 'End date must be after start date' };
  }
  return { valid: true };
}

async function createBarberTimeOff(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const { start_date, end_date } = req.body;
    const dateCheck = validateDateRange(start_date, end_date);
    if (!dateCheck.valid) return res.status(400).json({ error: dateCheck.error });

    // Check for overlapping time off periods
    const existing = await barberTimeOffService.getBarberTimeOffByBarberId(barberId);
    const overlap = existing.find(t => {
      return (start_date < t.end_date && end_date > t.start_date);
    });
    if (overlap) return res.status(409).json({ error: 'Time off overlaps with existing period' });

    const timeOff = await barberTimeOffService.createBarberTimeOff(barberId, req.body);
    res.status(201).json({ timeOff });
  } catch (err) {
    next(err);
  }
}

async function listBarberTimeOff(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const timeOffs = await barberTimeOffService.getBarberTimeOffByBarberId(barberId);
    res.json({ timeOffs });
  } catch (err) {
    next(err);
  }
}

async function updateBarberTimeOff(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const timeOffId = Number(req.params.timeOffId);
    const timeOff = await barberTimeOffService.getBarberTimeOffById(timeOffId);
    if (!timeOff) return res.status(404).json({ error: 'Time off not found' });

    if (timeOff.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    if (req.body.start_date && req.body.end_date) {
      const dateCheck = validateDateRange(req.body.start_date, req.body.end_date);
      if (!dateCheck.valid) return res.status(400).json({ error: dateCheck.error });
    }

    // If updating dates, check for overlaps
    if (req.body.start_date || req.body.end_date) {
      const start_date = req.body.start_date || timeOff.start_date;
      const end_date = req.body.end_date || timeOff.end_date;

      const existing = await barberTimeOffService.getBarberTimeOffByBarberId(barberId);
      const overlap = existing.find(t => {
        if (t.id === timeOffId) return false; // Skip self
        return (start_date < t.end_date && end_date > t.start_date);
      });
      if (overlap) return res.status(409).json({ error: 'Time off overlaps with existing period' });
    }

    const updated = await barberTimeOffService.updateBarberTimeOffById(timeOffId, req.body);
    res.json({ timeOff: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteBarberTimeOff(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barberId = Number(req.params.barberId);
    const barber = await barberService.getById(barberId);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    const timeOffId = Number(req.params.timeOffId);
    const timeOff = await barberTimeOffService.getBarberTimeOffById(timeOffId);
    if (!timeOff) return res.status(404).json({ error: 'Time off not found' });

    if (timeOff.barber_id !== barberId) return res.status(403).json({ error: 'Forbidden' });

    await barberTimeOffService.deleteBarberTimeOffById(timeOffId);
    res.json({ message: 'Time off deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBarberTimeOff, listBarberTimeOff, updateBarberTimeOff, deleteBarberTimeOff };
