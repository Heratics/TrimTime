const pool = require('../db/db');

async function createShop(data) {
  const { owner_user_id, name, slug, description, phone, email, country, city, district, address, latitude, longitude, google_maps_url, logo_url, cover_image_url } = data;
  const [result] = await pool.query(
    `INSERT INTO shops (owner_user_id, name, slug, description, phone, email, country, city, district, address, latitude, longitude, google_maps_url, logo_url, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [owner_user_id, name, slug, description || null, phone || null, email || null, country || 'Jordan', city || 'Aqaba', district || null, address || null, latitude || null, longitude || null, google_maps_url || null, logo_url || null, cover_image_url || null]
  );
  return getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM shops WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM shops WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] || null;
}

async function getAll() {
  const [rows] = await pool.query('SELECT * FROM shops ORDER BY created_at DESC');
  return rows;
}

async function getByOwnerId(owner_user_id) {
  const [rows] = await pool.query('SELECT * FROM shops WHERE owner_user_id = ? LIMIT 1', [owner_user_id]);
  return rows[0] || null;
}

async function updateById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['name','slug','description','phone','email','country','city','district','address','latitude','longitude','google_maps_url','logo_url','cover_image_url','is_active']){
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getById(id);
  values.push(id);
  await pool.query(`UPDATE shops SET ${fields.join(', ')} WHERE id = ?`, values);
  return getById(id);
}

async function deleteById(id) {
  await pool.query('DELETE FROM appointments WHERE shop_id = ?', [id]);
  await pool.query('DELETE FROM barber_schedules WHERE barber_id IN (SELECT id FROM barbers WHERE shop_id = ?)', [id]);
  await pool.query('DELETE FROM barber_breaks WHERE barber_id IN (SELECT id FROM barbers WHERE shop_id = ?)', [id]);
  await pool.query('DELETE FROM barber_time_off WHERE barber_id IN (SELECT id FROM barbers WHERE shop_id = ?)', [id]);
  await pool.query('DELETE FROM services WHERE shop_id = ?', [id]);
  await pool.query('DELETE FROM barbers WHERE shop_id = ?', [id]);
  await pool.query('DELETE FROM shop_hours WHERE shop_id = ?', [id]);
  await pool.query('DELETE FROM shops WHERE id = ?', [id]);
}

module.exports = { createShop, getById, getBySlug, getAll, getByOwnerId, updateById, deleteById };