const pool = require('../db/db');
const barberService = require('../services/barberService');
const shopService = require('../services/shopService');
const servicesService = require('../services/servicesService');
const barberScheduleService = require('../services/barberScheduleService');
const barberBreakService = require('../services/barberBreakService');
const barberTimeOffService = require('../services/barberTimeOffService');
const appointmentsService = require('../services/appointmentsService');
const availabilityService = require('../services/availabilityService');

function timeToMinutes(t) {
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTime(m) {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// Create appointment (public)
async function createAppointment(req, res, next) {
  const {
    shop_id, barber_id, service_id,
    customer_name, customer_phone,
    appointment_date, appointment_time
  } = req.body;

  try {
    if (!shop_id || !barber_id || !service_id || !customer_name || !customer_phone || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const barber = await barberService.getById(barber_id);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });
    if (!barber.is_active) return res.status(400).json({ error: 'Barber is disabled' });

    const shop = await shopService.getById(shop_id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    if (barber.shop_id !== shop.id) return res.status(400).json({ error: 'Barber does not belong to shop' });

    const service = await servicesService.getById(service_id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!service.is_active) return res.status(400).json({ error: 'Service is not active' });
    if (service.shop_id !== shop.id) return res.status(400).json({ error: 'Service does not belong to shop' });

    const dt = new Date(appointment_date + 'T00:00:00');
    if (isNaN(dt.getTime())) return res.status(400).json({ error: 'Invalid appointment_date' });
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(appointment_time)) return res.status(400).json({ error: 'Invalid appointment_time' });

    const slots = await availabilityService.getAvailableSlots({ barberId: barber_id, serviceId: service_id, date: appointment_date });
    if (!slots.includes(appointment_time.slice(0,5))) {
      return res.status(409).json({ error: 'Requested slot not available' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        "SELECT * FROM appointments WHERE barber_id = ? AND appointment_date = ? AND status IN ('pending','confirmed') FOR UPDATE",
        [barber_id, appointment_date]
      );

      const apStart = timeToMinutes(appointment_time);
      const apEnd = apStart + Number(service.duration_minutes);
      const conflict = rows.some(r => {
        const rStart = timeToMinutes(r.appointment_time);
        const rEnd = rStart + (Number(r.service_duration) || 0);
        return apStart < rEnd && apEnd > rStart;
      });
      if (conflict) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({ error: 'Requested slot conflicts with existing appointment' });
      }

      try {
        const created = await appointmentsService.create(conn, {
          shop_id, barber_id, service_id,
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration_minutes,
          customer_name,
          customer_phone,
          appointment_date,
          appointment_time,
          status: 'pending',
          booking_type: 'online'
        });

        await conn.commit();
        conn.release();

        const appointment = await appointmentsService.getById(created);
        return res.status(201).json({ appointment });
      } catch (err) {
        if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
          await conn.rollback();
          conn.release();
          return res.status(409).json({ error: 'Appointment slot already booked' });
        }
        throw err;
      }
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

// Walk-In appointment — staff only, finds earliest available slot automatically
async function createWalkIn(req, res, next) {
  try {
    const { role, userId } = req.user;

    // Only admin, owner, barber allowed
    if (!['admin', 'owner', 'barber'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { shop_id, barber_id, service_id, customer_name, customer_phone } = req.body;

    if (!shop_id || !barber_id || !service_id || !customer_name) {
      return res.status(400).json({ error: 'Missing required fields: shop_id, barber_id, service_id, customer_name' });
    }

    // ── Server-side permission check ────────────────────────────────────────
    const shop = await shopService.getById(shop_id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    if (role === 'owner') {
      // Owner must own this shop
      const ownerShop = await shopService.getByOwnerId(userId);
      if (!ownerShop || ownerShop.id !== shop.id) {
        return res.status(403).json({ error: 'You do not own this shop' });
      }
    }

    if (role === 'barber') {
      // Barber must belong to this shop
      const barberProfile = await barberService.getByUserId(userId);
      if (!barberProfile || barberProfile.shop_id !== shop.id) {
        return res.status(403).json({ error: 'You do not belong to this shop' });
      }
    }

    // ── Validate barber and service ────────────────────────────────────────
    const barber = await barberService.getById(barber_id);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });
    if (!barber.is_active) return res.status(400).json({ error: 'Barber is disabled' });
    if (barber.shop_id !== shop.id) return res.status(400).json({ error: 'Barber does not belong to this shop' });

    const service = await servicesService.getById(service_id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!service.is_active) return res.status(400).json({ error: 'Service is not active' });
    if (service.shop_id !== shop.id) return res.status(400).json({ error: 'Service does not belong to this shop' });

    // ── Find the earliest available slot starting from now ─────────────────
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });

    let availableSlots = [];
    try {
      availableSlots = await availabilityService.getAvailableSlots({
        barberId: barber_id,
        serviceId: service_id,
        date: todayStr
      });
    } catch (err) {
      // If no working schedule today etc., return helpful message
      const msg = (err && err.message) ? err.message : 'No availability today';
      return res.status(409).json({ error: `No available slot: ${msg}` });
    }

    if (!availableSlots || availableSlots.length === 0) {
      return res.status(409).json({ error: 'No available slots for today. The barber is fully booked.' });
    }

    // Pick the first (earliest) slot
    const appointment_time = availableSlots[0];
    const appointment_date = todayStr;

    // ── Book with lock (same pattern as createAppointment) ────────────────
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        "SELECT * FROM appointments WHERE barber_id = ? AND appointment_date = ? AND status IN ('pending','confirmed') FOR UPDATE",
        [barber_id, appointment_date]
      );

      const apStart = timeToMinutes(appointment_time);
      const apEnd = apStart + Number(service.duration_minutes);
      const conflict = rows.some(r => {
        const rStart = timeToMinutes(r.appointment_time);
        const rEnd = rStart + (Number(r.service_duration) || 0);
        return apStart < rEnd && apEnd > rStart;
      });

      if (conflict) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({ error: 'Walk-in slot just became unavailable. Please try again.' });
      }

      const created = await appointmentsService.create(conn, {
        shop_id,
        barber_id,
        service_id,
        service_name: service.name,
        service_price: service.price,
        service_duration: service.duration_minutes,
        customer_name,
        customer_phone: customer_phone || null,
        appointment_date,
        appointment_time,
        status: 'confirmed',  // Walk-ins are auto-confirmed
        booking_type: 'walkin'
      });

      await conn.commit();
      conn.release();

      const appointment = await appointmentsService.getById(created);
      return res.status(201).json({ appointment });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

// Public cancellation — no auth required
async function cancelAppointment(req, res, next) {
  try {
    const { confirmationNumber, phoneNumber } = req.body;
    if (!confirmationNumber || !phoneNumber) {
      return res.status(400).json({ error: 'Confirmation number and phone number are required.' });
    }

    const result = await appointmentsService.cancelByCustomer(confirmationNumber, phoneNumber);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ appointment: result.appointment });
  } catch (err) {
    next(err);
  }
}

// Owner sees all appointments in their shop
async function getAppointmentsForShop(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const appointments = await appointmentsService.getByShopId(shop.id);
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// Barber sees their own appointments
async function getAppointmentsForBarber(req, res, next) {
  try {
    const userId = req.user.userId;
    const barber = await barberService.getByUserId(userId);
    if (!barber) return res.status(404).json({ error: 'Barber profile not found' });

    const appointments = await appointmentsService.getByBarberId(barber.id);
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// Update appointment status (staff only)
async function updateAppointmentStatus(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending','confirmed','completed','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const appointment = await appointmentsService.getById(Number(id));
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const actorIsOwner = (req.user.role === 'owner');
    const actorIsBarber = (req.user.role === 'barber');
    const actorIsAdmin = (req.user.role === 'admin');
    let allowed = false;

    if (actorIsAdmin) allowed = true;
    if (actorIsOwner) {
      const shop = await shopService.getByOwnerId(userId);
      if (shop && shop.id === appointment.shop_id) allowed = true;
    }
    if (actorIsBarber) {
      const barber = await barberService.getByUserId(userId);
      if (barber && barber.id === appointment.barber_id) allowed = true;
    }

    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const allowedTransitions = {
      pending: ['confirmed','cancelled'],
      confirmed: ['completed','cancelled'],
      completed: [],
      cancelled: []
    };
    const from = appointment.status;
    const to = status;
    if (!allowedTransitions[from].includes(to)) return res.status(400).json({ error: `Invalid status transition from ${from} to ${to}` });

    const updated = await appointmentsService.updateStatus(appointment.id, to);
    res.json({ appointment: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAppointment,
  cancelAppointment,
  getAppointmentsForShop,
  getAppointmentsForBarber,
  updateAppointmentStatus,
  createWalkIn
};