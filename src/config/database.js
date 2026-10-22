const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:5432/${process.env.DB_NAME || 'recrutdncs'}`,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  pool,
  async query(sql, params) {
    const result = await pool.query(sql, params);
    return result.rows;
  },
  async getConnection() {
    return await pool.connect();
  },
  async getUserById(userId) {
    const result = await pool.query('SELECT id, email, nom, telephone, role, adresse, ville, bio, created_at, updated_at FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  }
};
