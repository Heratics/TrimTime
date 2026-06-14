const pool = require('../db/db');

class AppointmentsService {
  async getAll() {
    const [rows] = await pool.query(
      `SELECT appointments.*, shops.name AS shop_name, barbers.full_name AS barber_name
       FROM appointments
       JOIN shops ON shops.id = appointments.shop_id
       JOIN barbers ON barbers.id = appointments.barber_id
       ORDER BY appointments.appointment_date DESC, appointments.appointment_time DESC`
    );
    return rows;
  }

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
    return result.insertId;
  }

  async updateStatus(id, newStatus) {
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [newStatus, id]);
    return this.getById(id);
  }

  // Cancel via public flow — uses confirmation number (= appointment id) + phone match
  async cancelByCustomer(confirmationNumber, phoneNumber) {
    const id = Number(confirmationNumber);
    if (!id || isNaN(id)) return { error: 'Appointment not found.' };

    const appointment = await this.getById(id);
    if (!appointment) return { error: 'Appointment not found.' };

    // Phone must match (normalise whitespace only — keep digits as-is)
    const normalise = p => String(p || '').replace(/\s+/g, '');
    if (normalise(appointment.customer_phone) !== normalise(phoneNumber)) {
      return { error: 'Confirmation number and phone number do not match.' };
    }

    if (appointment.status === 'cancelled') {
      return { error: 'This appointment has already been cancelled.' };
    }

    // Check if appointment date/time has passed (Amman timezone)
    const apptDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const nowAmman = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Amman' }));
    if (apptDateTime < nowAmman) {
      return { error: 'This appointment has already passed and cannot be cancelled.' };
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return { error: 'This appointment cannot be cancelled.' };
    }

    // Cancel it — set cancelled_at and cancel_reason (future-proofed)
    await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = ?
       WHERE id = ?`,
      ['customer_request', id]
    );

    return { appointment: await this.getById(id) };
  }
}

module.exports = new AppointmentsService();