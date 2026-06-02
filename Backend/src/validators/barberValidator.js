const { body } = require('express-validator');

const createRules = [
  body('full_name').isString().isLength({ min: 2, max: 150 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('profile_image_url').optional().isURL(),
  body('user_id').optional().isInt()
];

const updateRules = [
  body('full_name').optional().isString().isLength({ min: 2, max: 150 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  body('profile_image_url').optional().isURL(),
  body('user_id').optional().isInt(),
  body('is_active').optional().isBoolean()
];

module.exports = { createRules, updateRules };
