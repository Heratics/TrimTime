const appointmentsService = require('../services/appointmentsService');
const barberService = require('../services/barberService');
const servicesService = require('../services/servicesService');
const shopService = require('../services/shopService');
const userService = require('../services/userService');

const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

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
      active_barbers: barbers.filter(barber => barber.is_active).length,
      active_services: services.filter(service => service.is_active).length,
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
};
