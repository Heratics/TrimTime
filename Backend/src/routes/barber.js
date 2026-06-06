const express = require('express');
const router = express.Router();
const { requireAuth, requireBarber } = require('../middleware/roles');
const c = require('../controllers/barberDashboardController');

router.get('/dashboard', requireAuth, requireBarber, c.getDashboard);
router.get('/schedule', requireAuth, requireBarber, c.getSchedule);
router.put('/profile', requireAuth, requireBarber, c.updateProfile);

router.post('/schedule', requireAuth, requireBarber, c.addSchedule);
router.delete('/schedule/:id', requireAuth, requireBarber, c.deleteSchedule);

router.post('/breaks', requireAuth, requireBarber, c.addBreak);
router.delete('/breaks/:id', requireAuth, requireBarber, c.deleteBreak);

router.post('/timeoff', requireAuth, requireBarber, c.addTimeOff);
router.delete('/timeoff/:id', requireAuth, requireBarber, c.deleteTimeOff);

module.exports = router;