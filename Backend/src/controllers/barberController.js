const barberService = require('../services/barberService');
const shopService = require('../services/shopService');
const barberScheduleService = require('../services/barberScheduleService');
const barberBreakService = require('../services/barberBreakService');
const barberTimeOffService = require('../services/barberTimeOffService');

async function create(req, res, next) {
  try {
    // owner must have created a shop first
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    // Owner can optionally provide user_id to link a user account to this barber
    // If not provided, barber profile exists without authentication
    // Can be linked later via PUT /api/barbers/:id with { user_id: ... }
    const barber = await barberService.createBarber(shop.id, req.body);
    res.status(201).json({ barber });
  } catch (err) {
    next(err);
  }
}

async function getByShop(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barbers = await barberService.getByShopId(shop.id);
    res.json({ barbers });
  } catch (err) {
    next(err);
  }
}

async function getMyBarber(req, res, next) {
  try {
    const barber = await barberService.getByUserId(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });
    res.json({ barber });
  } catch (err) {
    next(err);
  }
}

async function getMySchedule(req, res, next) {
  try {
    const barber = await barberService.getByUserId(req.user.userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });

    const [schedule, breaks, timeOff] = await Promise.all([
      barberScheduleService.getBarberScheduleByBarberId(barber.id),
      barberBreakService.getBarberBreaksByBarberId(barber.id),
      barberTimeOffService.getBarberTimeOffByBarberId(barber.id),
    ]);

    res.json({ schedule, breaks, timeOff, barber });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barber = await barberService.getById(Number(req.params.id));
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    // verify barber belongs to owner's shop
    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    res.json({ barber });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barber = await barberService.getById(Number(req.params.id));
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    // verify barber belongs to owner's shop
    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    // Owner can update barber details including linking a user account via { user_id: <userId> }
    const updated = await barberService.updateById(barber.id, req.body);
    res.json({ barber: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteBarber(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const barber = await barberService.getById(Number(req.params.id));
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    // verify barber belongs to owner's shop
    if (barber.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    await barberService.deleteById(barber.id);
    res.json({ message: 'Barber deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getByShop, getById, update, deleteBarber, getMyBarber, getMySchedule };
