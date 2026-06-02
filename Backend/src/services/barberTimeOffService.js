const pool = require('../db/db');

async function createBarberTimeOff(barber_id, data) {
  const { start_date, end_date, reason } = data;
  const [result] = await pool.query(
    'INSERT INTO barber_time_off (barber_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
    [barber_id, start_date, end_date, reason || null]
  );
  return getBarberTimeOffById(result.insertId);
}

async function getBarberTimeOffById(id) {
  const [rows] = await pool.query('SELECT * FROM barber_time_off WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getBarberTimeOffByBarberId(barber_id) {
  const [rows] = await pool.query('SELECT * FROM barber_time_off WHERE barber_id = ? ORDER BY start_date ASC', [barber_id]);
  return rows;
}

async function updateBarberTimeOffById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['start_date', 'end_date', 'reason']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getBarberTimeOffById(id);
  values.push(id);
  await pool.query(`UPDATE barber_time_off SET ${fields.join(', ')} WHERE id = ?`, values);
  return getBarberTimeOffById(id);
}

async function deleteBarberTimeOffById(id) {
  await pool.query('DELETE FROM barber_time_off WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createBarberTimeOff,
  getBarberTimeOffById,
  getBarberTimeOffByBarberId,
  updateBarberTimeOffById,
  deleteBarberTimeOffById
};
