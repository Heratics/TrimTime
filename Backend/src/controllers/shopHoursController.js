const shopHoursService = require('../services/shopHoursService');
const shopService = require('../services/shopService');

function validateTimeRange(open_time, close_time) {
  if (open_time >= close_time) {
    return { valid: false, error: 'Close time must be after open time' };
  }
  return { valid: true };
}

async function createShopHours(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const { open_time, close_time } = req.body;
    const timeCheck = validateTimeRange(open_time, close_time);
    if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });

    const hours = await shopHoursService.createShopHours(shop.id, req.body);
    res.status(201).json({ hours });
  } catch (err) {
    next(err);
  }
}

async function listShopHours(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const hours = await shopHoursService.getShopHoursByShopId(shop.id);
    res.json({ hours });
  } catch (err) {
    next(err);
  }
}

async function getShopHours(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const hours = await shopHoursService.getShopHoursById(Number(req.params.id));
    if (!hours) return res.status(404).json({ error: 'Shop hours not found' });

    if (hours.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    res.json({ hours });
  } catch (err) {
    next(err);
  }
}

async function updateShopHours(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const hours = await shopHoursService.getShopHoursById(Number(req.params.id));
    if (!hours) return res.status(404).json({ error: 'Shop hours not found' });

    if (hours.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    if (req.body.open_time && req.body.close_time) {
      const timeCheck = validateTimeRange(req.body.open_time, req.body.close_time);
      if (!timeCheck.valid) return res.status(400).json({ error: timeCheck.error });
    }

    const updated = await shopHoursService.updateShopHoursById(hours.id, req.body);
    res.json({ hours: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteShopHours(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const hours = await shopHoursService.getShopHoursById(Number(req.params.id));
    if (!hours) return res.status(404).json({ error: 'Shop hours not found' });

    if (hours.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    await shopHoursService.deleteShopHoursById(hours.id);
    res.json({ message: 'Shop hours deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createShopHours, listShopHours, getShopHours, updateShopHours, deleteShopHours };
