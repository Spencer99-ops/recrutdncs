const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, nom, telephone, role = 'candidat' } = userData;
    
    // Vérifier si le mot de passe est déjà hashé
    const isHashed = password.startsWith('$2b$') || password.startsWith('$2a$');
    const hashedPassword = isHashed ? password : await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (email, password, nom, telephone, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // S'assurer que telephone n'est pas undefined
    const telephoneValue = telephone === undefined ? null : telephone;
    
    const result = await query(sql, [email, hashedPassword, nom, telephoneValue, role]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users[0] || null;
  }

  static async findById(id) {
    const sql = 'SELECT id, email, nom, telephone, role, bio, created_at FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  static async update(id, userData) {
    const { nom, telephone, bio } = userData;
    const sql = `
      UPDATE users 
      SET nom = ?, telephone = ?, bio = ?
      WHERE id = ?
    `;
    
    await query(sql, [nom, telephone, bio, id]);
    return await this.findById(id);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll() {
    const sql = 'SELECT id, email, nom, telephone, role, created_at FROM users ORDER BY created_at DESC';
    return await query(sql);
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
  }
}

module.exports = User;
