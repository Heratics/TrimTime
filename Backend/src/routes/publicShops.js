const express = require('express');
const router = express.Router();
const publicShopController = require('../controllers/publicShopController');

router.get('/', publicShopController.list);
router.get('/:slug', publicShopController.getBySlug);

module.exports = router;
