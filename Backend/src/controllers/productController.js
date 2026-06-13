const productService = require('../services/productService');
const shopService = require('../services/shopService');
const { uploadBuffer } = require('../config/Cloudinary');

async function list(req, res, next) {
  try {
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    const products = await productService.getByShopId(shop.id);
    res.json({ products });
  } catch (err) {
    console.error('PRODUCTS LIST ERROR:', err.message, err.stack);
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const data = { ...req.body };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, { folder: 'trimtime/products' });
      data.image_url = result.secure_url;
    }

    const product = await productService.create(shop.id, data);
    res.status(201).json({ product });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, { folder: 'trimtime/products' });
      data.image_url = result.secure_url;
    }

    const product = await productService.updateById(Number(req.params.id), data);
    res.json({ product });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await productService.deleteById(Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };