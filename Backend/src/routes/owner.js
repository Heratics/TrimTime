const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/roles');
const ownerController = require('../controllers/ownerController');

router.get('/dashboard', requireAuth, requireOwner, ownerController.getDashboard);

module.exports = router;
