const pool = require('../db/db');

async function getByShopId(shopId) {
  const [rows] = await pool.query(
    `SELECT review_id, shop_id, reviewer_name, rating, comment, created_at
     FROM reviews
     WHERE shop_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [shopId]
  );
  return rows;
}

async function getStatsForShop(shopId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total_reviews, AVG(rating) AS average_rating
     FROM reviews
     WHERE shop_id = ?`,
    [shopId]
  );
  const total = parseInt(rows[0].total_reviews, 10) || 0;
  const avg = total > 0 ? Math.round(parseFloat(rows[0].average_rating) * 10) / 10 : 0;
  return { totalReviews: total, averageRating: avg };
}

async function create({ shopId, reviewerName, rating, comment }) {
  const [result] = await pool.query(
    `INSERT INTO reviews (shop_id, reviewer_name, rating, comment, created_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP())`,
    [shopId, reviewerName.trim(), rating, comment ? comment.trim() : null]
  );
  const [rows] = await pool.query(
    `SELECT review_id, shop_id, reviewer_name, rating, comment, created_at
     FROM reviews WHERE review_id = ?`,
    [result.insertId]
  );
  return rows[0];
}

async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id   INT          NOT NULL AUTO_INCREMENT,
      shop_id     INT          NOT NULL,
      reviewer_name VARCHAR(100) NOT NULL,
      rating      DECIMAL(2,1) NOT NULL,
      comment     TEXT         NULL,
      created_at  DATETIME     NOT NULL DEFAULT UTC_TIMESTAMP(),
      PRIMARY KEY (review_id),
      CONSTRAINT fk_reviews_shop FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
      CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5)
    )
  `);
}

module.exports = { getByShopId, getStatsForShop, create, createTable };
