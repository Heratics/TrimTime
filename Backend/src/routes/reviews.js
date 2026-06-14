const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET /api/reviews/shop/:shopId
router.get('/shop/:shopId', reviewController.getForShop);

// POST /api/reviews
router.post('/', reviewController.create);

module.exports = router;
