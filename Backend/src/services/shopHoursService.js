const pool = require('../db/db');

async function createShopHours(shop_id, data) {
  const { day_of_week, open_time, close_time, is_closed } = data;
  const [result] = await pool.query(
    'INSERT INTO shop_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)',
    [shop_id, day_of_week, open_time, close_time, is_closed || false]
  );
  return getShopHoursById(result.insertId);
}

async function getShopHoursById(id) {
  const [rows] = await pool.query('SELECT * FROM shop_hours WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getShopHoursByShopId(shop_id) {
  const [rows] = await pool.query('SELECT * FROM shop_hours WHERE shop_id = ? ORDER BY day_of_week ASC', [shop_id]);
  return rows;
}

async function updateShopHoursById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['day_of_week', 'open_time', 'close_time', 'is_closed']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getShopHoursById(id);
  values.push(id);
  await pool.query(`UPDATE shop_hours SET ${fields.join(', ')} WHERE id = ?`, values);
  return getShopHoursById(id);
}

async function deleteShopHoursById(id) {
  await pool.query('DELETE FROM shop_hours WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createShopHours,
  getShopHoursById,
  getShopHoursByShopId,
  updateShopHoursById,
  deleteShopHoursById
};
