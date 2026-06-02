const appointmentsService = require('../services/appointmentsService');
const barberService = require('../services/barberService');
const servicesService = require('../services/servicesService');
const shopService = require('../services/shopService');

async function getDashboard(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const shopId = shop.id;
    const appointments = await appointmentsService.getByShopId(shopId);
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;

    const barbers = await barberService.getByShopId(shopId);
    const active_barbers = barbers.filter(b => b.is_active).length;

    const services = await servicesService.getByShopId(shopId);
    const active_services = services.filter(s => s.is_active).length;

    res.json({
      total_appointments: total,
      pending_appointments: pending,
      confirmed_appointments: confirmed,
      completed_appointments: completed,
      active_barbers,
      active_services
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
