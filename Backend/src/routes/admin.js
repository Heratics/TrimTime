const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/roles');
const { updateRules: shopUpdateRules } = require('../validators/shopValidator');
const { validationResult } = require('express-validator');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/owners', adminController.listOwners);
router.get('/owners/pending', adminController.listPendingOwners);
router.put('/owners/:id/approve', adminController.approveUser);
router.put('/owners/:id/reject', adminController.rejectUser);
router.put('/owners/:id/disable', adminController.disableOwner);
router.delete('/owners/:id', adminController.deleteOwner);

router.get('/appointments', adminController.listAppointments);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);

router.get('/barbers', adminController.listBarbers);
router.put('/barbers/:id/status', adminController.updateBarberStatus);
router.delete('/barbers/:id', adminController.deleteBarber);

router.get('/shops', adminController.listShops);
router.put('/shops/:id', adminController.updateShop);
router.put('/shops/:id/toggle', adminController.toggleShop);
router.delete('/shops/:id', adminController.deleteShop);

router.get('/services', adminController.listServices);
router.put('/services/:id/status', adminController.updateServiceStatus);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Create a barber user account (and optionally link to a barber profile)
router.post('/barber-users', adminController.createBarberUser);

// List all user accounts
router.get('/users', adminController.listUsers);

module.exports = router;
