const servicesService = require('../services/servicesService');
const shopService = require('../services/shopService');

async function createService(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const { category, name, description, duration_minutes, price } = req.body;

    // Validation: Duration must be greater than 0
    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0 minutes' });
    }

    // Validation: Price cannot be negative
    if (price === undefined || price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }

    // Validation: Service name required
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Service name is required' });
    }

    // Validation: Service name must be unique within the shop
    const existingService = await servicesService.getByName(shop.id, name.trim());
    if (existingService) {
      return res.status(409).json({ error: 'Service name already exists in this shop' });
    }

    const service = await servicesService.create(shop.id, {
      category,
      name: name.trim(),
      description,
      duration_minutes,
      price
    });

    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
}

async function getServices(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const services = await servicesService.getByShopId(shop.id);
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const serviceId = Number(req.params.id);
    const service = await servicesService.getById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    res.json({ service });
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const serviceId = Number(req.params.id);
    const service = await servicesService.getById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    // Validation: Duration must be greater than 0
    if (req.body.duration_minutes !== undefined && req.body.duration_minutes <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0 minutes' });
    }

    // Validation: Price cannot be negative
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }

    // Validation: Check unique name if name is being updated
    if (req.body.name && req.body.name.trim() !== service.name) {
      const existingService = await servicesService.getByName(shop.id, req.body.name.trim());
      if (existingService) {
        return res.status(409).json({ error: 'Service name already exists in this shop' });
      }
    }

    const updated = await servicesService.updateById(serviceId, req.body);
    res.json({ service: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteService(req, res, next) {
  try {
    const ownerId = req.user.userId;
    const shop = await shopService.getByOwnerId(ownerId);
    if (!shop) return res.status(404).json({ error: 'Owner has no shop' });

    const serviceId = Number(req.params.id);
    const service = await servicesService.getById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.shop_id !== shop.id) return res.status(403).json({ error: 'Forbidden' });

    await servicesService.deleteById(serviceId);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService
};
