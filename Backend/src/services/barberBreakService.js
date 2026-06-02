const pool = require('../db/db');

async function createBarberBreak(barber_id, data) {
  const { day_of_week, break_start, break_end, reason } = data;
  const [result] = await pool.query(
    'INSERT INTO barber_breaks (barber_id, day_of_week, break_start, break_end, reason) VALUES (?, ?, ?, ?, ?)',
    [barber_id, day_of_week, break_start, break_end, reason || null]
  );
  return getBarberBreakById(result.insertId);
}

async function getBarberBreakById(id) {
  const [rows] = await pool.query('SELECT * FROM barber_breaks WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getBarberBreaksByBarberId(barber_id) {
  const [rows] = await pool.query('SELECT * FROM barber_breaks WHERE barber_id = ? ORDER BY day_of_week ASC, break_start ASC', [barber_id]);
  return rows;
}

async function updateBarberBreakById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['day_of_week', 'break_start', 'break_end', 'reason']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getBarberBreakById(id);
  values.push(id);
  await pool.query(`UPDATE barber_breaks SET ${fields.join(', ')} WHERE id = ?`, values);
  return getBarberBreakById(id);
}

async function deleteBarberBreakById(id) {
  await pool.query('DELETE FROM barber_breaks WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createBarberBreak,
  getBarberBreakById,
  getBarberBreaksByBarberId,
  updateBarberBreakById,
  deleteBarberBreakById
};
