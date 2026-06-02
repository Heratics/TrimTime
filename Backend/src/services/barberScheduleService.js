const pool = require('../db/db');

async function createBarberSchedule(barber_id, data) {
  const { day_of_week, start_time, end_time, is_working } = data;
  const [result] = await pool.query(
    'INSERT INTO barber_schedule (barber_id, day_of_week, start_time, end_time, is_working) VALUES (?, ?, ?, ?, ?)',
    [barber_id, day_of_week, start_time, end_time, is_working !== false]
  );
  return getBarberScheduleById(result.insertId);
}

async function getBarberScheduleById(id) {
  const [rows] = await pool.query('SELECT * FROM barber_schedule WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getBarberScheduleByBarberId(barber_id) {
  const [rows] = await pool.query('SELECT * FROM barber_schedule WHERE barber_id = ? ORDER BY day_of_week ASC', [barber_id]);
  return rows;
}

async function updateBarberScheduleById(id, data) {
  const fields = [];
  const values = [];
  for (const key of ['day_of_week', 'start_time', 'end_time', 'is_working']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getBarberScheduleById(id);
  values.push(id);
  await pool.query(`UPDATE barber_schedule SET ${fields.join(', ')} WHERE id = ?`, values);
  return getBarberScheduleById(id);
}

async function deleteBarberScheduleById(id) {
  await pool.query('DELETE FROM barber_schedule WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createBarberSchedule,
  getBarberScheduleById,
  getBarberScheduleByBarberId,
  updateBarberScheduleById,
  deleteBarberScheduleById
};
