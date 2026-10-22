const { query } = require('../config/database');

class Application {
  static async create(applicationData) {
    const { job_id, user_id, cv_path, lettre_motivation } = applicationData;
    
    const sql = `
      INSERT INTO applications (job_id, user_id, cv_path, lettre_motivation, statut)
      VALUES (?, ?, ?, ?, 'en_attente')
    `;
    
    const result = await query(sql, [job_id, user_id, cv_path, lettre_motivation]);
    return result.insertId;
  }

  static async findByUserId(user_id) {
    const sql = `
      SELECT a.*, j.titre, j.entreprise, j.ville, u.nom as recruteur_nom
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `;
    
    return await query(sql, [user_id]);
  }

  static async findByRecruiterId(recruiter_id) {
    const sql = `
      SELECT a.*, j.titre, j.entreprise, j.ville, u.nom as candidat_nom, u.email as candidat_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE j.user_id = ?
      ORDER BY a.created_at DESC
    `;
    
    return await query(sql, [recruiter_id]);
  }

  static async findAll() {
    const sql = `
      SELECT a.*, j.titre as job_titre, j.entreprise, j.ville, 
             u_c.nom as candidat_nom, u_c.email as candidat_email,
             u_r.nom as recruteur_nom
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u_c ON a.user_id = u_c.id
      JOIN users u_r ON j.user_id = u_r.id
      ORDER BY a.created_at DESC
    `;
    
    return await query(sql);
  }

  static async findById(id) {
    const sql = `
      SELECT a.*, j.titre, j.entreprise, j.ville, 
             u_c.nom as candidat_nom, u_c.email as candidat_email,
             u_r.nom as recruteur_nom, u_r.email as recruteur_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u_c ON a.user_id = u_c.id
      JOIN users u_r ON j.user_id = u_r.id
      WHERE a.id = ?
    `;
    
    const applications = await query(sql, [id]);
    return applications[0] || null;
  }

  static async updateStatus(id, statut, user_id = null) {
    let sql = `
      UPDATE applications 
      SET statut = ?
    `;
    
    const params = [statut];
    
    if (user_id) {
      sql += `
        WHERE id = ? AND job_id IN (
          SELECT id FROM jobs WHERE user_id = ?
        )
      `;
      params.push(id, user_id);
    } else {
      sql += ' WHERE id = ?';
      params.push(id);
    }
    
    await query(sql, params);
    return await this.findById(id);
  }

  static async hasAlreadyApplied(job_id, user_id) {
    const sql = 'SELECT id FROM applications WHERE job_id = ? AND user_id = ?';
    const applications = await query(sql, [job_id, user_id]);
    return applications.length > 0;
  }
}

module.exports = Application;
