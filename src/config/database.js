const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recrutdncs',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

module.exports = {
  pool,
  async query(sql, params) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  async getConnection() {
    return await pool.getConnection();
  },
  async getUserById(userId) {
    const [rows] = await pool.execute('SELECT id, email, nom, telephone, role, adresse, ville, bio, created_at, updated_at FROM users WHERE id = ?', [userId]);
    return rows[0] || null;
  }
};
