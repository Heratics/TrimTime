const pool = require('../db/db');

class ServicesService {
  async getByShopId(shopId) {
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE shop_id = ? ORDER BY category, name',
      [shopId]
    );
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async getByName(shopId, name) {
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE shop_id = ? AND name = ?',
      [shopId, name]
    );
    return rows[0] || null;
  }

  async create(shopId, { category, name, description, duration_minutes, price }) {
    const [result] = await pool.query(
      'INSERT INTO services (shop_id, category, name, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?, ?)',
      [shopId, category, name, description, duration_minutes, price]
    );
    return this.getById(result.insertId);
  }

  async updateById(id, data) {
    const updateFields = [];
    const updateValues = [];
    
    if (data.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(data.category);
    }
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(data.description);
    }
    if (data.duration_minutes !== undefined) {
      updateFields.push('duration_minutes = ?');
      updateValues.push(data.duration_minutes);
    }
    if (data.price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(data.price);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(data.is_active);
    }

    if (updateFields.length === 0) return this.getById(id);

    updateValues.push(id);
    await pool.query(
      `UPDATE services SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    return this.getById(id);
  }

  async deleteById(id) {
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new ServicesService();
