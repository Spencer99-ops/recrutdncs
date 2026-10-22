const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:5432/${process.env.DB_NAME || 'recrutdncs'}`,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.initDatabase();
    }

    async initDatabase() {
        try {
            const client = await this.pool.connect();
            console.log('=== Connexion à la base de données PostgreSQL établie ===');
            client.release();
        } catch (error) {
            console.error('Erreur de connexion à la base de données:', error);
            process.exit(1);
        }
    }

    async query(sql, params = []) {
        try {
            const result = await this.pool.query(sql, params);
            return result.rows;
        } catch (error) {
            console.error('Erreur de requête SQL:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const users = await this.query(sql, [email]);
        return users[0] || null;
    }

    async getUserById(id) {
        const sql = 'SELECT id, email, nom, telephone, role, bio, created_at, updated_at FROM users WHERE id = $1';
        const users = await this.query(sql, [id]);
        return users[0] || null;
    }

    async createUser(userData) {
        const sql = `
            INSERT INTO users (email, password, nom, telephone, role, bio, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id
        `;
        const result = await this.query(sql, [
            userData.email,
            userData.password,
            userData.nom,
            userData.telephone || null,
            userData.role || 'candidat',
            userData.bio || null
        ]);

        return {
            id: result[0].id,
            email: userData.email,
            nom: userData.nom,
            telephone: userData.telephone,
            role: userData.role,
            bio: userData.bio
        };
    }

    async updateUser(id, updates) {
        const fields = [];
        const values = [];
        let counter = 1;

        if (updates.nom) {
            fields.push(`nom = $${counter++}`);
            values.push(updates.nom);
        }
        if (updates.telephone) {
            fields.push(`telephone = $${counter++}`);
            values.push(updates.telephone);
        }
        if (updates.bio !== undefined) {
            fields.push(`bio = $${counter++}`);
            values.push(updates.bio);
        }

        if (fields.length === 0) return false;

        fields.push('updated_at = NOW()');
        values.push(id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${counter}`;
        const result = await this.pool.query(sql, values);

        return result.rowCount > 0;
    }

    async getAllUsers() {
        const sql = 'SELECT id, email, nom, telephone, role, bio, created_at, updated_at FROM users ORDER BY created_at DESC';
        return await this.query(sql);
    }

    async deleteUser(id) {
        const sql = 'DELETE FROM users WHERE id = $1';
        const result = await this.pool.query(sql, [id]);
        return result.rowCount > 0;
    }

    async createJob(jobData) {
        const sql = `
            INSERT INTO jobs (titre, description, requirements, benefits, entreprise, location, type_contrat, salaire_min, salaire_max, remote, user_id, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING id
        `;
        const result = await this.query(sql, [
            jobData.titre,
            jobData.description,
            jobData.requirements || null,
            jobData.benefits || null,
            jobData.entreprise,
            jobData.location,
            jobData.type_contrat,
            jobData.salaire_min || null,
            jobData.salaire_max || null,
            jobData.remote || false,
            jobData.user_id,
            jobData.status || 'active'
        ]);

        return {
            id: result[0].id,
            ...jobData
        };
    }

    async getJobs(filters = {}) {
        let sql = `
            SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            WHERE j.status = 'active'
        `;
        const params = [];
        let counter = 1;

        if (filters.location) {
            sql += ` AND j.location LIKE $${counter++}`;
            params.push(`%${filters.location}%`);
        }

        if (filters.type_contrat) {
            sql += ` AND j.type_contrat = $${counter++}`;
            params.push(filters.type_contrat);
        }

        if (filters.titre) {
            sql += ` AND j.titre LIKE $${counter++}`;
            params.push(`%${filters.titre}%`);
        }

        if (filters.entreprise) {
            sql += ` AND j.entreprise LIKE $${counter++}`;
            params.push(`%${filters.entreprise}%`);
        }

        if (filters.remote !== undefined) {
            sql += ` AND j.remote = $${counter++}`;
            params.push(filters.remote);
        }

        sql += ' ORDER BY j.created_at DESC';

        return await this.query(sql, params);
    }

    async getJobById(id) {
        const sql = `
            SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            WHERE j.id = $1
        `;
        const jobs = await this.query(sql, [id]);
        return jobs[0] || null;
    }

    async updateJob(id, updates, userId = null) {
        const fields = [];
        const values = [];
        let counter = 1;

        if (updates.titre) {
            fields.push(`titre = $${counter++}`);
            values.push(updates.titre);
        }
        if (updates.description) {
            fields.push(`description = $${counter++}`);
            values.push(updates.description);
        }
        if (updates.requirements !== undefined) {
            fields.push(`requirements = $${counter++}`);
            values.push(updates.requirements);
        }
        if (updates.benefits !== undefined) {
            fields.push(`benefits = $${counter++}`);
            values.push(updates.benefits);
        }
        if (updates.entreprise) {
            fields.push(`entreprise = $${counter++}`);
            values.push(updates.entreprise);
        }
        if (updates.location) {
            fields.push(`location = $${counter++}`);
            values.push(updates.location);
        }
        if (updates.type_contrat) {
            fields.push(`type_contrat = $${counter++}`);
            values.push(updates.type_contrat);
        }
        if (updates.salaire_min !== undefined) {
            fields.push(`salaire_min = $${counter++}`);
            values.push(updates.salaire_min);
        }
        if (updates.salaire_max !== undefined) {
            fields.push(`salaire_max = $${counter++}`);
            values.push(updates.salaire_max);
        }
        if (updates.remote !== undefined) {
            fields.push(`remote = $${counter++}`);
            values.push(updates.remote);
        }
        if (updates.status) {
            fields.push(`status = $${counter++}`);
            values.push(updates.status);
        }

        if (fields.length === 0) return false;

        fields.push('updated_at = NOW()');
        values.push(id);
        const idIndex = counter++;

        let sql = `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${idIndex}`;

        if (userId) {
            sql += ` AND user_id = $${counter++}`;
            values.push(userId);
        }

        const result = await this.pool.query(sql, values);
        return result.rowCount > 0;
    }

    async deleteJob(id, userId = null) {
        let sql = 'DELETE FROM jobs WHERE id = $1';
        const params = [id];
        let counter = 2;

        if (userId) {
            sql += ` AND user_id = $${counter++}`;
            params.push(userId);
        }

        const result = await this.pool.query(sql, params);
        return result.rowCount > 0;
    }

    async createApplication(applicationData) {
        const sql = `
            INSERT INTO applications (job_id, user_id, cv_path, cover_letter_path, message_motivation, statut, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'en_attente', NOW(), NOW())
            RETURNING id
        `;
        const result = await this.query(sql, [
            applicationData.job_id,
            applicationData.user_id,
            applicationData.cv_path || null,
            applicationData.cover_letter_path || null,
            applicationData.message_motivation || null
        ]);

        return {
            id: result[0].id,
            ...applicationData,
            statut: 'en_attente'
        };
    }

    async getApplications(userRole, userId = null) {
        let sql = `
            SELECT a.*, j.titre as job_titre, j.entreprise, j.location, u.nom as candidat_nom, u.email as candidat_email
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let counter = 1;

        if (userRole === 'candidat' && userId) {
            sql += ` AND a.user_id = $${counter++}`;
            params.push(userId);
        } else if (userRole === 'recruteur' && userId) {
            sql += ` AND j.user_id = $${counter++}`;
            params.push(userId);
        }

        sql += ' ORDER BY a.created_at DESC';

        return await this.query(sql, params);
    }

    async updateApplicationStatus(id, status, userId = null) {
        const validStatuses = ['en_attente', 'en_revue', 'entretien', 'accepte', 'refuse'];
        if (!validStatuses.includes(status)) {
            throw new Error('Statut invalide');
        }

        let sql = `
            UPDATE applications
            SET statut = $1, updated_at = NOW()
            WHERE id = $2
        `;
        const params = [status, id];
        let counter = 3;

        if (userId) {
            sql += ` AND job_id IN (SELECT id FROM jobs WHERE user_id = $${counter++})`;
            params.push(userId);
        }

        const result = await this.pool.query(sql, params);
        return result.rowCount > 0;
    }

    // Méthodes pour les documents
    async createDocument(documentData) {
        const sql = `
            INSERT INTO documents (user_id, type, file_name, file_path, file_size, mime_type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id
        `;
        const result = await this.query(sql, [
            documentData.user_id,
            documentData.type,
            documentData.file_name,
            documentData.file_path,
            documentData.file_size || null,
            documentData.mime_type || null
        ]);

        return {
            id: result[0].id,
            ...documentData
        };
    }

    async getDocumentsByUser(userId) {
        const sql = 'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC';
        return await this.query(sql, [userId]);
    }

    async deleteDocument(id, userId = null) {
        let sql = 'DELETE FROM documents WHERE id = $1';
        const params = [id];
        let counter = 2;

        if (userId) {
            sql += ` AND user_id = $${counter++}`;
            params.push(userId);
        }

        const result = await this.pool.query(sql, params);
        return result.rowCount > 0;
    }

    // Méthodes pour les notifications
    async createNotification(notificationData) {
        const sql = `
            INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `;
        const result = await this.query(sql, [
            notificationData.user_id,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.is_read || false
        ]);

        return {
            id: result[0].id,
            ...notificationData
        };
    }

    async getNotificationsByUser(userId, unreadOnly = false) {
        let sql = 'SELECT * FROM notifications WHERE user_id = $1';
        const params = [userId];

        if (unreadOnly) {
            sql += ' AND is_read = FALSE';
        }

        sql += ' ORDER BY created_at DESC';

        return await this.query(sql, params);
    }

    async markNotificationAsRead(id, userId = null) {
        let sql = 'UPDATE notifications SET is_read = TRUE WHERE id = $1';
        const params = [id];
        let counter = 2;

        if (userId) {
            sql += ` AND user_id = $${counter++}`;
            params.push(userId);
        }

        const result = await this.pool.query(sql, params);
        return result.rowCount > 0;
    }

    async deleteNotification(id, userId = null) {
        let sql = 'DELETE FROM notifications WHERE id = $1';
        const params = [id];
        let counter = 2;

        if (userId) {
            sql += ` AND user_id = $${counter++}`;
            params.push(userId);
        }

        const result = await this.pool.query(sql, params);
        return result.rowCount > 0;
    }

    // Méthodes pour les statistiques
    async getStatistics() {
        const sql = 'SELECT * FROM statistics WHERE metric_date = CURRENT_DATE ORDER BY metric_name';
        return await this.query(sql);
    }

    async createStatistic(statisticData) {
        const sql = `
            INSERT INTO statistics (metric_name, metric_value, metric_date)
            VALUES ($1, $2, $3)
            ON CONFLICT (metric_name, metric_date)
            DO UPDATE SET metric_value = EXCLUDED.metric_value
            RETURNING id
        `;
        const result = await this.query(sql, [
            statisticData.metric_name,
            statisticData.metric_value,
            statisticData.metric_date || new Date().toISOString().split('T')[0]
        ]);

        return {
            id: result[0].id,
            ...statisticData
        };
    }

    async updateAllStatistics() {
        const stats = {};

        // Statistiques des utilisateurs
        const totalUsers = await this.query('SELECT COUNT(*) as count FROM users');
        stats.total_users = parseInt(totalUsers[0].count);

        const adminUsers = await this.query("SELECT COUNT(*) as count FROM users WHERE role = 'administrateur'");
        stats.total_administrateurs = parseInt(adminUsers[0].count);

        const recruteurUsers = await this.query("SELECT COUNT(*) as count FROM users WHERE role = 'recruteur'");
        stats.total_recruteurs = parseInt(recruteurUsers[0].count);

        const candidatUsers = await this.query("SELECT COUNT(*) as count FROM users WHERE role = 'candidat'");
        stats.total_candidats = parseInt(candidatUsers[0].count);

        // Statistiques des jobs
        const totalJobs = await this.query('SELECT COUNT(*) as count FROM jobs');
        stats.total_jobs = parseInt(totalJobs[0].count);

        const activeJobs = await this.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'");
        stats.active_jobs = parseInt(activeJobs[0].count);

        // Statistiques des applications
        const totalApplications = await this.query('SELECT COUNT(*) as count FROM applications');
        stats.total_applications = parseInt(totalApplications[0].count);

        const pendingApplications = await this.query("SELECT COUNT(*) as count FROM applications WHERE statut = 'en_attente'");
        stats.pending_applications = parseInt(pendingApplications[0].count);

        const interviewApplications = await this.query("SELECT COUNT(*) as count FROM applications WHERE statut = 'entretien'");
        stats.interviews_scheduled = parseInt(interviewApplications[0].count);

        // Mettre à jour toutes les statistiques
        for (const [metricName, metricValue] of Object.entries(stats)) {
            await this.createStatistic({
                metric_name: metricName,
                metric_value: metricValue,
                metric_date: new Date().toISOString().split('T')[0]
            });
        }

        return stats;
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = new Database();
