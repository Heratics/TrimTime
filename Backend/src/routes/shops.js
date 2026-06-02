const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { requireAuth, requireOwner } = require('../middleware/roles');
const { createRules, updateRules } = require('../validators/shopValidator');
const { validationResult } = require('express-validator');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/', requireAuth, requireOwner, createRules, runValidation, shopController.create);
router.get('/', shopController.list);
router.get('/me', requireAuth, requireOwner, shopController.getMyShop);
router.get('/:slug', shopController.getBySlug);
router.put('/:id', requireAuth, requireOwner, updateRules, runValidation, shopController.update);

module.exports = router;
