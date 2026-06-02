const express = require('express');
const router = express.Router();
const shopHoursController = require('../controllers/shopHoursController');
const { requireAuth, requireOwner } = require('../middleware/roles');
const { shopHoursRules } = require('../validators/schedulingValidator');
const { validationResult } = require('express-validator');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/', requireAuth, requireOwner, shopHoursRules, runValidation, shopHoursController.createShopHours);
router.get('/', requireAuth, requireOwner, shopHoursController.listShopHours);
router.get('/:id', requireAuth, requireOwner, shopHoursController.getShopHours);
router.put('/:id', requireAuth, requireOwner, shopHoursRules, runValidation, shopHoursController.updateShopHours);
router.delete('/:id', requireAuth, requireOwner, shopHoursController.deleteShopHours);

module.exports = router;
