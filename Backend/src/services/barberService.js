const pool = require('../db/db');

async function createBarber(shop_id, data) {
  const { user_id, full_name, bio, profile_image_url, is_active } = data;
  const [result] = await pool.query(
    'INSERT INTO barbers (user_id, shop_id, full_name, bio, profile_image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id || null, shop_id, full_name, bio || null, profile_image_url || null, is_active !== false]
  );
  return getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM barbers WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getByShopId(shop_id) {
  const [rows] = await pool.query('SELECT * FROM barbers WHERE shop_id = ? ORDER BY created_at DESC', [shop_id]);
  return rows;
}

async function getAll() {
  const [rows] = await pool.query(
    'SELECT barbers.*, shops.name AS shop_name FROM barbers JOIN shops ON shops.id = barbers.shop_id ORDER BY barbers.created_at DESC'
  );
  return rows;
}

async function updateById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['user_id', 'full_name', 'bio', 'profile_image_url', 'is_active']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getById(id);
  values.push(id);
  await pool.query(`UPDATE barbers SET ${fields.join(', ')} WHERE id = ?`, values);
  return getById(id);
}

async function deleteById(id) {
  await pool.query('DELETE FROM barbers WHERE id = ?', [id]);
  return true;
}

async function getByUserId(user_id) {
  const [rows] = await pool.query('SELECT * FROM barbers WHERE user_id = ? LIMIT 1', [user_id]);
  return rows[0] || null;
}

module.exports = { createBarber, getById, getByShopId, getAll, updateById, deleteById, getByUserId };
