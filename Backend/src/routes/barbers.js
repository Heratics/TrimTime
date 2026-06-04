const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const barberSchedulingRoutes = require('./barberScheduling');
const { requireAuth, requireOwner } = require('../middleware/roles');
const { createRules, updateRules } = require('../validators/barberValidator');
const { validationResult } = require('express-validator');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/', requireAuth, requireOwner, createRules, runValidation, barberController.create);
router.get('/shop', requireAuth, requireOwner, barberController.getByShop);
// Mount barber scheduling routes FIRST so /:id doesn't swallow them
router.use('/:barberId', barberSchedulingRoutes);

router.get('/:id', requireAuth, requireOwner, barberController.getById);
router.put('/:id', requireAuth, requireOwner, updateRules, runValidation, barberController.update);
router.delete('/:id', requireAuth, requireOwner, barberController.deleteBarber);;

module.exports = router;
