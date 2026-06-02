const pool = require('../db/db');

class AppointmentsService {
  // Returns appointments for a barber on a specific date.
  // Optional `statuses` array filters by appointment status (e.g. ['pending','confirmed']).
  async getByBarberAndDate(barberId, date, statuses = ['pending','confirmed']) {
    if (Array.isArray(statuses) && statuses.length > 0) {
      const placeholders = statuses.map(() => '?').join(',');
      const params = [barberId, date, ...statuses];
      const [rows] = await pool.query(
        `SELECT * FROM appointments WHERE barber_id = ? AND appointment_date = ? AND status IN (${placeholders})`,
        params
      );
      return rows;
    }

    // No status filtering
    const [rows] = await pool.query(
      'SELECT * FROM appointments WHERE barber_id = ? AND appointment_date = ?',
      [barberId, date]
    );
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  async getByShopId(shopId) {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE shop_id = ? ORDER BY appointment_date DESC, appointment_time DESC', [shopId]);
    return rows;
  }

  async getByBarberId(barberId) {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE barber_id = ? ORDER BY appointment_date DESC, appointment_time DESC', [barberId]);
    return rows;
  }

  // Create appointment using a connection (transaction handled by caller) or via pool
  async create(connOrPool, data) {
    const q = connOrPool.query.bind(connOrPool);
    const {
      shop_id, barber_id, service_id, service_name, service_price, service_duration,
      customer_name, customer_phone, appointment_date, appointment_time, status = 'pending'
    } = data;

    const [result] = await q(
      'INSERT INTO appointments (shop_id, barber_id, service_id, service_name, service_price, service_duration, customer_name, customer_phone, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [shop_id, barber_id, service_id, service_name, service_price, service_duration, customer_name, customer_phone, appointment_date, appointment_time, status]
    );
    return this.getById(result.insertId);
  }

  async updateStatus(id, newStatus) {
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [newStatus, id]);
    return this.getById(id);
  }
}

module.exports = new AppointmentsService();
