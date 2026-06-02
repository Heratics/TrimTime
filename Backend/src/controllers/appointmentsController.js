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

// Create appointment
async function createAppointment(req, res, next) {
  const {
    shop_id, barber_id, service_id,
    customer_name, customer_phone,
    appointment_date, appointment_time
  } = req.body;

  try {
    // Basic validation
    if (!shop_id || !barber_id || !service_id || !customer_name || !customer_phone || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Validate barber
    const barber = await barberService.getById(barber_id);
    if (!barber) return res.status(404).json({ error: 'Barber not found' });
    if (!barber.is_active) return res.status(400).json({ error: 'Barber is disabled' });

    // 2. Validate shop
    const shop = await shopService.getById(shop_id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    if (barber.shop_id !== shop.id) return res.status(400).json({ error: 'Barber does not belong to shop' });

    // 3. Validate service
    const service = await servicesService.getById(service_id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    if (!service.is_active) return res.status(400).json({ error: 'Service is not active' });
    if (service.shop_id !== shop.id) return res.status(400).json({ error: 'Service does not belong to shop' });

    // 5. Validate appointment date/time format
    const dt = new Date(appointment_date + 'T00:00:00');
    if (isNaN(dt.getTime())) return res.status(400).json({ error: 'Invalid appointment_date' });
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(appointment_time)) return res.status(400).json({ error: 'Invalid appointment_time' });

    // 6. Re-run availability validation: check requested time is in availability
    const slots = await availabilityService.getAvailableSlots({ barberId: barber_id, serviceId: service_id, date: appointment_date });
    if (!slots.includes(appointment_time.slice(0,5))) {
      return res.status(409).json({ error: 'Requested slot not available' });
    }

    // 8-9. Prevent double booking and create appointment within transaction using SELECT ... FOR UPDATE
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock relevant appointments for this barber/date
      const [rows] = await conn.query(
        "SELECT * FROM appointments WHERE barber_id = ? AND appointment_date = ? AND status IN ('pending','confirmed') FOR UPDATE",
        [barber_id, appointment_date]
      );

      // Re-check conflict against locked rows
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

      // Insert appointment (snapshot service fields)
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
          status: 'pending'
        });

        await conn.commit();
        conn.release();

        return res.status(201).json({ appointment: created });
      } catch (err) {
        // Duplicate-key error protection: unique constraint on barber/date/time
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

// Update appointment status
async function updateAppointmentStatus(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending','confirmed','completed','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const appointment = await appointmentsService.getById(Number(id));
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Determine actor permissions: owner of shop or barber assigned
    const actorIsOwner = (req.user.role === 'owner');
    const actorIsBarber = (req.user.role === 'barber');
    let allowed = false;

    if (actorIsOwner) {
      const shop = await shopService.getByOwnerId(userId);
      if (shop && shop.id === appointment.shop_id) allowed = true;
    }
    if (actorIsBarber) {
      const barber = await barberService.getByUserId(userId);
      if (barber && barber.id === appointment.barber_id) allowed = true;
    }

    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    // Validate allowed transitions
    const from = appointment.status;
    const to = status;
    const allowedTransitions = {
      pending: ['confirmed','cancelled'],
      confirmed: ['completed','cancelled'],
      completed: [],
      cancelled: []
    };
    if (!allowedTransitions[from].includes(to)) return res.status(400).json({ error: `Invalid status transition from ${from} to ${to}` });

    const updated = await appointmentsService.updateStatus(appointment.id, to);
    res.json({ appointment: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAppointment,
  getAppointmentsForShop,
  getAppointmentsForBarber,
  updateAppointmentStatus
};
