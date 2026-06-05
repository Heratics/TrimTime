const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireOwner } = require('../middleware/roles');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getCurrentUser);
router.put('/password', requireAuth, authController.changePassword);

// Owner-only: look up a user by email to get their ID for barber linking
router.get('/lookup', requireAuth, requireOwner, authController.lookupByEmail);

module.exports = router;
