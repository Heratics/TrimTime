const { body, param } = require('express-validator');

const allowedFields = [
  'name','slug','description','phone','email','country','city','district','address','latitude','longitude','google_maps_url','logo_url','cover_image_url'
];

const createRules = [
  body('name').isString().isLength({ min: 2 }),
  body('slug').optional().isString().isLength({ min: 2 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
];

const updateRules = [
  body('name').optional().isString().isLength({ min: 2 }),
  body('slug').optional().isString().isLength({ min: 2 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
];

module.exports = { createRules, updateRules };
