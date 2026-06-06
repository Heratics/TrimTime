const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appointmentsService = require('../services/appointmentsService');
const barberService = require('../services/barberService');
const servicesService = require('../services/servicesService');
const shopService = require('../services/shopService');
const userService = require('../services/userService');

const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const SALT_ROUNDS = process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : 12;

async function getDashboard(req, res, next) {
  try {
    const [shops, owners, barbers, appointments, services] = await Promise.all([
      shopService.getAll(),
      userService.getByRole('owner'),
      barberService.getAll(),
      appointmentsService.getAll(),
      servicesService.getAll(),
    ]);

    res.json({
      total_shops: shops.length,
      total_owners: owners.length,
      total_barbers: barbers.length,
      total_appointments: appointments.length,
      active_barbers: barbers.filter(b => b.is_active).length,
      active_services: services.filter(s => s.is_active).length,
    });
  } catch (err) {
    next(err);
  }
}

async function listShops(req, res, next) {
  try {
    res.json({ shops: await shopService.getAll() });
  } catch (err) {
    next(err);
  }
}

async function listOwners(req, res, next) {
  try {
    res.json({ owners: await userService.getByRole('owner') });
  } catch (err) {
    next(err);
  }
}

async function listBarbers(req, res, next) {
  try {
    res.json({ barbers: await barberService.getAll() });
  } catch (err) {
    next(err);
  }
}

async function listServices(req, res, next) {
  try {
    res.json({ services: await servicesService.getAll() });
  } catch (err) {
    next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    res.json({ appointments: await appointmentsService.getAll() });
  } catch (err) {
    next(err);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const status = req.body.status;
    if (!appointmentStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const appointment = await appointmentsService.getById(Number(req.params.id));
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ appointment: await appointmentsService.updateStatus(appointment.id, status) });
  } catch (err) {
    next(err);
  }
}

async function updateShop(req, res, next) {
  try {
    const shop = await shopService.getById(Number(req.params.id));
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const payload = { ...req.body };
    if (payload.slug && payload.slug !== shop.slug) {
      let uniqueSlug = payload.slug;
      let attempt = 0;
      while (await shopService.getBySlug(uniqueSlug)) {
        attempt += 1;
        uniqueSlug = `${payload.slug}-${attempt}`;
      }
      payload.slug = uniqueSlug;
    }

    res.json({ shop: await shopService.updateById(shop.id, payload) });
  } catch (err) {
    next(err);
  }
}

async function updateBarberStatus(req, res, next) {
  try {
    if (typeof req.body.is_active !== 'boolean') return res.status(400).json({ error: 'is_active must be boolean' });

    const barber = await barberService.getById(Number(req.params.id));
    if (!barber) return res.status(404).json({ error: 'Barber not found' });

    res.json({ barber: await barberService.updateById(barber.id, { is_active: req.body.is_active }) });
  } catch (err) {
    next(err);
  }
}

async function updateServiceStatus(req, res, next) {
  try {
    if (typeof req.body.is_active !== 'boolean') return res.status(400).json({ error: 'is_active must be boolean' });

    const service = await servicesService.getById(Number(req.params.id));
    if (!service) return res.status(404).json({ error: 'Service not found' });

    res.json({ service: await servicesService.updateById(service.id, { is_active: req.body.is_active }) });
  } catch (err) {
    next(err);
  }
}

// Admin creates a barber user account and optionally links it to a barber profile
async function createBarberUser(req, res, next) {
  try {
    const { full_name, email, password, phone, barber_id } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email, and password are required' });
    }

    const existing = await userService.getByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userService.create({ full_name, email, password_hash, phone, role: 'barber' });

    // Optionally link to an existing barber profile
    let barber = null;
    if (barber_id) {
      barber = await barberService.getById(Number(barber_id));
      if (barber) {
        barber = await barberService.updateById(barber.id, { user_id: user.id });
      }
    }

    const { password_hash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, barber: barber || null });
  } catch (err) {
    next(err);
  }
}

// List all users (admin use)
async function listUsers(req, res, next) {
  try {
    const [owners, barbers] = await Promise.all([
      userService.getByRole('owner'),
      userService.getByRole('barber'),
    ]);
    res.json({ users: [...owners, ...barbers] });
  } catch (err) {
    next(err);
  }
}

async function listPendingOwners(req, res, next) {
  try {
    const [rows] = await pool.query(
    "SELECT id, full_name, email, phone, status, created_at FROM users WHERE role = 'owner' AND status != 'pending' ORDER BY created_at DESC"
    );
    res.json({ owners: rows });
  } catch (err) {
    next(err);
  }
}

async function approveUser(req, res, next) {
  try {
    const user = await userService.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await userService.updateById(user.id, { status: 'active' });
    const { password_hash: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
}

async function rejectUser(req, res, next) {
  try {
    const user = await userService.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await userService.updateById(user.id, { status: 'rejected' });
    const { password_hash: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
}

async function disableOwner(req, res, next) {
  try {
    const user = await userService.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'owner') return res.status(400).json({ error: 'User is not an owner' });
    const newStatus = user.status === 'disabled' ? 'active' : 'disabled';
    const updated = await userService.updateById(user.id, { status: newStatus });
    const { password_hash: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
}

async function deleteOwner(req, res, next) {
  try {
    const user = await userService.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'owner') return res.status(400).json({ error: 'User is not an owner' });

    const shop = await shopService.getByOwnerId(user.id);
    if (shop) return res.status(400).json({ error: 'Cannot delete owner while they have an active shop. Delete the shop first.' });

    await userService.deleteById(user.id);
    res.json({ message: 'Owner deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  listShops,
  listOwners,
  listBarbers,
  listServices,
  listAppointments,
  updateAppointmentStatus,
  updateShop,
  updateBarberStatus,
  updateServiceStatus,
  createBarberUser,
  listUsers,
  listPendingOwners,
  approveUser,
  rejectUser,
  disableOwner,
  deleteOwner,
};
