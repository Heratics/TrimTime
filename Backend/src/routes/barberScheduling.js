const express = require('express');
const router = express.Router({ mergeParams: true });
const barberScheduleController = require('../controllers/barberScheduleController');
const barberBreakController = require('../controllers/barberBreakController');
const barberTimeOffController = require('../controllers/barberTimeOffController');
const { requireAuth, requireOwner } = require('../middleware/roles');
const { barberScheduleRules, barberBreakRules, barberTimeOffRules } = require('../validators/schedulingValidator');
const { validationResult } = require('express-validator');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Barber Schedule routes: /api/barbers/:barberId/schedule
router.post('/schedule', requireAuth, requireOwner, barberScheduleRules, runValidation, barberScheduleController.createBarberSchedule);
router.get('/schedule', requireAuth, requireOwner, barberScheduleController.listBarberSchedule);
router.put('/schedule/:scheduleId', requireAuth, requireOwner, barberScheduleRules, runValidation, barberScheduleController.updateBarberSchedule);
router.delete('/schedule/:scheduleId', requireAuth, requireOwner, barberScheduleController.deleteBarberSchedule);

// Barber Break routes: /api/barbers/:barberId/breaks
router.post('/breaks', requireAuth, requireOwner, barberBreakRules, runValidation, barberBreakController.createBarberBreak);
router.get('/breaks', requireAuth, requireOwner, barberBreakController.listBarberBreaks);
router.put('/breaks/:breakId', requireAuth, requireOwner, barberBreakRules, runValidation, barberBreakController.updateBarberBreak);
router.delete('/breaks/:breakId', requireAuth, requireOwner, barberBreakController.deleteBarberBreak);

// Barber Time Off routes: /api/barbers/:barberId/time-off
router.post('/time-off', requireAuth, requireOwner, barberTimeOffRules, runValidation, barberTimeOffController.createBarberTimeOff);
router.get('/time-off', requireAuth, requireOwner, barberTimeOffController.listBarberTimeOff);
router.put('/time-off/:timeOffId', requireAuth, requireOwner, barberTimeOffRules, runValidation, barberTimeOffController.updateBarberTimeOff);
router.delete('/time-off/:timeOffId', requireAuth, requireOwner, barberTimeOffController.deleteBarberTimeOff);

module.exports = router;
