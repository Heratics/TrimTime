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
    const { email, password, ...barberData } = req.body;

    let user_id = barberData.user_id || null;

    if (email && password) {
      const bcrypt = require('bcryptjs');
      const userService = require('../services/userService');
      const SALT_ROUNDS = process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 12;

      const existing = await userService.getByEmail(email);
      if (existing) return res.status(409).json({ error: 'A user account with this email already exists.' });

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await userService.create({
        full_name: barberData.full_name,
        email,
        password_hash,
        phone: barberData.phone || null,
        role: 'barber',
        status: 'active'
      });
      user_id = newUser.id;
    }

    const barber = await barberService.createBarber(shop.id, { ...barberData, user_id });
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
