const pool = require('../db/db');

async function getByShopId(shopId) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE shop_id = ? AND is_active = 1 ORDER BY id DESC',
    [shopId]
  );
  return rows;
}

async function getById(id) {
  const [[row]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return row || null;
}

async function create(shopId, data) {
  const { name, description, price, image_url, stock_quantity } = data;
  const [result] = await pool.query(
    'INSERT INTO products (shop_id, name, description, price, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [shopId, name, description || null, price || null, image_url || null, stock_quantity || 0]
  );
  return getById(result.insertId);
}

async function updateById(id, data) {
  const allowed = ['name', 'description', 'price', 'image_url', 'stock_quantity', 'is_active'];
  const keys = Object.keys(data).filter(k => allowed.includes(k));
  if (keys.length === 0) return getById(id);
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => data[k]);
  await pool.query(`UPDATE products SET ${sets} WHERE id = ?`, [...values, id]);
  return getById(id);
}

async function deleteById(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = { getByShopId, getById, create, updateById, deleteById };