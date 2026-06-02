const express = require('express');
const router = express.Router();
const { requireAuth, requireBarber } = require('../middleware/roles');
const barberDashboardController = require('../controllers/barberDashboardController');

router.get('/dashboard', requireAuth, requireBarber, barberDashboardController.getDashboard);
router.get('/schedule', requireAuth, requireBarber, barberDashboardController.getSchedule);

module.exports = router;
