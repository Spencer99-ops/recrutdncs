const { query } = require('../config/database');

class Job {
  static async create(jobData) {
    const { titre, description, entreprise, ville, type_contrat, salaire, user_id } = jobData;
    
    const sql = `
      INSERT INTO jobs (titre, description, entreprise, ville, type_contrat, salaire, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [titre, description, entreprise, ville, type_contrat, salaire, user_id]);
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.ville) {
      sql += ' AND j.ville LIKE ?';
      params.push(`%${filters.ville}%`);
    }
    
    if (filters.type_contrat) {
      sql += ' AND j.type_contrat = ?';
      params.push(filters.type_contrat);
    }
    
    if (filters.titre) {
      sql += ' AND j.titre LIKE ?';
      params.push(`%${filters.titre}%`);
    }
    
    sql += ' ORDER BY j.created_at DESC';
    
    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.id = ?
    `;
    
    const jobs = await query(sql, [id]);
    return jobs[0] || null;
  }

  static async findByUserId(user_id) {
    const sql = `
      SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.user_id = ?
      ORDER BY j.created_at DESC
    `;
    
    return await query(sql, [user_id]);
  }

  static async update(id, jobData, user_id = null) {
    const { titre, description, entreprise, ville, type_contrat, salaire } = jobData;
    
    let sql = `
      UPDATE jobs 
      SET titre = ?, description = ?, entreprise = ?, ville = ?, type_contrat = ?, salaire = ?
    `;
    
    const params = [titre, description, entreprise, ville, type_contrat, salaire];
    
    if (user_id) {
      sql += ' WHERE id = ? AND user_id = ?';
      params.push(id, user_id);
    } else {
      sql += ' WHERE id = ?';
      params.push(id);
    }
    
    await query(sql, params);
    return await this.findById(id);
  }

  static async delete(id, user_id = null) {
    let sql = 'DELETE FROM jobs';
    
    if (user_id) {
      sql += ' WHERE id = ? AND user_id = ?';
      await query(sql, [id, user_id]);
    } else {
      sql += ' WHERE id = ?';
      await query(sql, [id]);
    }
  }
}

module.exports = Job;
