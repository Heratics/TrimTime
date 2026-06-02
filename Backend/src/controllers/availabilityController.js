const availabilityService = require('../services/availabilityService');

async function getAvailability(req, res, next) {
  try {
    const barberId = Number(req.query.barber_id);
    const serviceId = Number(req.query.service_id);
    const date = req.query.date; // YYYY-MM-DD

    if (!barberId || !serviceId || !date) {
      return res.status(400).json({ error: 'barber_id, service_id and date are required' });
    }

    const slots = await availabilityService.getAvailableSlots({ barberId, serviceId, date });
    res.json({ slots });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getAvailability };