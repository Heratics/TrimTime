const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/roles');
const productController = require('../controllers/productController');

router.get('/', requireAuth, requireOwner, productController.list);
router.post('/', requireAuth, requireOwner, productController.create);
router.put('/:id', requireAuth, requireOwner, productController.update);
router.delete('/:id', requireAuth, requireOwner, productController.remove);

module.exports = router;