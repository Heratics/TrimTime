const shopService = require('../services/shopService');
const userService = require('../services/userService');
const slugify = require('../utils/slugify');

async function create(req, res, next) {
  try {
    // requireOwner middleware ensures req.user exists and role=owner
    const ownerId = req.user.userId;

    // one owner can only own one shop initially
    const existing = await shopService.getByOwnerId(ownerId);
    if (existing) return res.status(409).json({ error: 'Owner already has a shop' });

    const payload = { ...req.body };
    payload.owner_user_id = ownerId;

    // validate lat/lng presence/format done in validators; ensure slug
    if (!payload.slug) {
      payload.slug = slugify(payload.name || `shop-${Date.now()}`);
    }

    // ensure slug uniqueness: append number if needed
    let uniqueSlug = payload.slug;
    let attempt = 0;
    while (await shopService.getBySlug(uniqueSlug)) {
      attempt += 1;
      uniqueSlug = `${payload.slug}-${attempt}`;
    }
    payload.slug = uniqueSlug;

    const shop = await shopService.createShop(payload);
    res.status(201).json({ shop });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const shops = await shopService.getAll();
    res.json({ shops });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const slug = req.params.slug;
    const shop = await shopService.getBySlug(slug);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const shop = await shopService.getById(id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    // only owner who owns the shop can update
    if (req.user.role !== 'owner' || shop.owner_user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = { ...req.body };
    if (payload.slug && payload.slug !== shop.slug) {
      // ensure new slug unique
      let uniqueSlug = payload.slug;
      let attempt = 0;
      while (await shopService.getBySlug(uniqueSlug)) {
        attempt += 1;
        uniqueSlug = `${payload.slug}-${attempt}`;
      }
      payload.slug = uniqueSlug;
    }

    const updated = await shopService.updateById(id, payload);
    res.json({ shop: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getBySlug, update };
// Owner-specific helper: get current owner's shop
async function getMyShop(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}

module.exports.getMyShop = getMyShop;
