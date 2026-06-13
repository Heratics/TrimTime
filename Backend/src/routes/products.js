const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/roles');
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', requireAuth, requireOwner, productController.list);
router.post('/', requireAuth, requireOwner, upload.single('product_image'), productController.create);
router.put('/:id', requireAuth, requireOwner, upload.single('product_image'), productController.update);
router.delete('/:id', requireAuth, requireOwner, productController.remove);

module.exports = router;