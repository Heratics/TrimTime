const pool = require('../db/db');

async function getByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function getByRole(role) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, role, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
    [role]
  );
  return rows;
}

async function create({ full_name, email, password_hash, phone, role }) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, password_hash, phone || null, role]
  );
  const id = result.insertId;
  return getById(id);
}

async function updateById(id, fields) {
  const allowed = ['full_name', 'email', 'phone', 'password_hash', 'role', 'status'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return getById(id);
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  await pool.query(`UPDATE users SET ${sets} WHERE id = ?`, [...values, id]);
  return getById(id);
}

async function deleteById(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = { getByEmail, getById, getByRole, create, updateById, deleteById };
