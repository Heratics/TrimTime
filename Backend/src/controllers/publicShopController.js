const barberService = require('../services/barberService');
const servicesService = require('../services/servicesService');
const shopHoursService = require('../services/shopHoursService');
const shopService = require('../services/shopService');
const productService = require('../services/productService');

const dayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function isOpenNow(hours, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Amman',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const getPart = type => parts.find(part => part.type === type)?.value;
  const dayHours = hours.find(hour => hour.day_of_week === dayNumbers[getPart('weekday')]);
  if (!dayHours || dayHours.is_closed) return false;

  const currentTime = `${getPart('hour')}:${getPart('minute')}`;
  return currentTime >= dayHours.open_time.slice(0, 5) && currentTime < dayHours.close_time.slice(0, 5);
}

async function getPublicShop(shop) {
  const [hours, barbers, services, products] = await Promise.all([
    shopHoursService.getShopHoursByShopId(shop.id),
    barberService.getByShopId(shop.id),
    servicesService.getByShopId(shop.id),
    productService.getByShopId(shop.id),
  ]);

  const { owner_user_id, ...publicShop } = shop;
  return {
    ...publicShop,
    hours,
    barbers: barbers
      .filter(barber => barber.is_active)
      .map(({ user_id, ...barber }) => barber),
    services: services.filter(service => service.is_active),
    products,
    is_open_now: isOpenNow(hours),
  };
}

async function list(req, res, next) {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const district = String(req.query.district || '').trim().toLowerCase();
    const openNow = req.query.open_now === 'true';
    const shops = await shopService.getAll();
    const publicShops = await Promise.all(
      shops
        .filter(shop => String(shop.city || '').toLowerCase() === 'aqaba')
        .map(getPublicShop)
    );

    const filtered = publicShops.filter(shop => {
      const matchesSearch = !search ||
        shop.name.toLowerCase().includes(search) ||
        shop.barbers.some(barber => barber.full_name.toLowerCase().includes(search));
      const matchesDistrict = !district || String(shop.district || '').toLowerCase() === district;
      const matchesOpenNow = !openNow || shop.is_open_now;
      return matchesSearch && matchesDistrict && matchesOpenNow;
    });

    const districts = [...new Set(publicShops.map(shop => shop.district).filter(Boolean))].sort();
    res.json({ shops: filtered, districts });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const shop = await shopService.getBySlug(req.params.slug);
    if (!shop || String(shop.city || '').toLowerCase() !== 'aqaba') {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ shop: await getPublicShop(shop) });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug };
