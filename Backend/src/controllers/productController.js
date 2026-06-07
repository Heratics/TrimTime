const productService = require('../services/productService');
const shopService = require('../services/shopService');

async function list(req, res, next) {
  try {
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    const products = await productService.getByShopId(shop.id);
    res.json({ products });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const shop = await shopService.getByOwnerId(req.user.userId);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    const product = await productService.create(shop.id, req.body);
    res.status(201).json({ product });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateById(Number(req.params.id), req.body);
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