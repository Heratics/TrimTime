const { body } = require('express-validator');

const shopHoursRules = [
  body('day_of_week').isInt({ min: 0, max: 6 }),
  body('open_time').matches(/^\d{2}:\d{2}$/),
  body('close_time').matches(/^\d{2}:\d{2}$/),
  body('is_closed').optional().isBoolean()
];

const barberScheduleRules = [
  body('day_of_week').isInt({ min: 0, max: 6 }),
  body('start_time').matches(/^\d{2}:\d{2}$/),
  body('end_time').matches(/^\d{2}:\d{2}$/),
  body('is_working').optional().isBoolean()
];

const barberBreakRules = [
  body('day_of_week').isInt({ min: 0, max: 6 }),
  body('break_start').matches(/^\d{2}:\d{2}$/),
  body('break_end').matches(/^\d{2}:\d{2}$/),
  body('reason').optional().isString().isLength({ max: 255 })
];

const barberTimeOffRules = [
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('reason').optional().isString().isLength({ max: 255 })
];

module.exports = { shopHoursRules, barberScheduleRules, barberBreakRules, barberTimeOffRules };
