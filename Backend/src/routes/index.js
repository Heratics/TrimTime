const express = require('express');
const router = express.Router();

const health = require('../controllers/healthController');
const authRoutes = require('./auth');
const shopRoutes = require('./shops');
const barberRoutes = require('./barbers');
const shopHoursRoutes = require('./shopHours');
const servicesRoutes = require('./services');
const availabilityRoutes = require('./availability');
const appointmentsRoutes = require('./appointments');
const ownerRoutes = require('./owner');
const barberDashboardRoutes = require('./barber');
const adminRoutes = require('./admin');
const publicShopRoutes = require('./publicShops');
const productRoutes = require('./products');

router.get('/health', health.getHealth);
router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/barbers', barberRoutes);
router.use('/shop-hours', shopHoursRoutes);
router.use('/services', servicesRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/owner', ownerRoutes);
router.use('/barber', barberDashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/public/shops', publicShopRoutes);
router.use('/products', productRoutes);

module.exports = router;
