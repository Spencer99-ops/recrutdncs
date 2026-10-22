const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats - Statistiques générales pour l'admin
router.get('/stats', authenticateToken, requireRole('administrateur'), async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'candidat') as total_candidates,
                (SELECT COUNT(*) FROM users WHERE role = 'recruteur') as total_recruiters,
                (SELECT COUNT(*) FROM users WHERE role = 'administrateur') as total_admins,
                (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
                (SELECT COUNT(*) FROM jobs) as total_jobs,
                (SELECT COUNT(*) FROM applications) as total_applications,
                (SELECT COUNT(*) FROM applications WHERE statut = 'en_attente') as pending_applications,
                (SELECT COUNT(*) FROM applications WHERE statut = 'en_revue') as review_applications,
                (SELECT COUNT(*) FROM applications WHERE statut = 'entretien') as interview_applications,
                (SELECT COUNT(*) FROM applications WHERE statut = 'accepte') as accepted_applications,
                (SELECT COUNT(*) FROM applications WHERE statut = 'refuse') as rejected_applications,
                (SELECT COUNT(*) FROM notifications WHERE is_read = 0) as unread_notifications,
                (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
                (SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURDATE()) as new_applications_today
        `);
        
        // Statistiques mensuelles
        const monthlyStats = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM users 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month
        `);
        
        // Répartition par rôle
        const roleDistribution = await db.query(`
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        `);
        
        // Candidatures par statut
        const applicationStatus = await db.query(`
            SELECT statut, COUNT(*) as count
            FROM applications
            GROUP BY statut
        `);
        
        res.json({
            success: true,
            data: {
                overview: stats[0],
                monthlyGrowth: monthlyStats,
                roleDistribution,
                applicationStatus
            }
        });
    } catch (error) {
        console.error('Erreur stats admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// GET /api/admin/users - Liste des utilisateurs avec pagination
router.get('/users', authenticateToken, requireRole('administrateur'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const role = req.query.role;
        
        let whereClause = '';
        let params = [];
        
        if (role && role !== 'all') {
            whereClause = 'WHERE role = ?';
            params.push(role);
        }
        
        const users = await db.query(`
            SELECT id, email, nom, prenom, telephone, role, bio, created_at
            FROM users 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        const total = await db.query(`
            SELECT COUNT(*) as total
            FROM users 
            ${whereClause}
        `, params);
        
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total: total[0].total,
                    pages: Math.ceil(total[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Erreur users admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});

// GET /api/admin/applications - Liste des candidatures récentes
router.get('/applications', authenticateToken, requireRole('administrateur'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        let whereClause = '';
        let params = [];
        
        if (status && status !== 'all') {
            whereClause = 'WHERE a.statut = ?';
            params.push(status);
        }
        
        const applications = await db.query(`
            SELECT 
                a.id,
                a.statut,
                a.message_motivation,
                a.interview_date,
                a.feedback,
                a.created_at,
                u.id as user_id,
                u.nom as candidate_name,
                u.email as candidate_email,
                u.telephone as candidate_phone,
                j.id as job_id,
                j.titre as job_title,
                j.entreprise as company,
                j.location as job_location
            FROM applications a
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        const total = await db.query(`
            SELECT COUNT(*) as total
            FROM applications a
            ${whereClause}
        `, params);
        
        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    page,
                    limit,
                    total: total[0].total,
                    pages: Math.ceil(total[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Erreur applications admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures'
        });
    }
});

// GET /api/admin/jobs - Liste des offres d'emploi
router.get('/jobs', authenticateToken, requireRole('administrateur'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        let whereClause = '';
        let params = [];
        
        if (status && status !== 'all') {
            whereClause = 'WHERE status = ?';
            params.push(status);
        }
        
        const jobs = await db.query(`
            SELECT 
                id,
                titre,
                description,
                entreprise,
                location,
                type_contrat,
                salaire_min,
                salaire_max,
                status,
                created_at,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id) as application_count
            FROM jobs
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        const total = await db.query(`
            SELECT COUNT(*) as total
            FROM jobs
            ${whereClause}
        `, params);
        
        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page,
                    limit,
                    total: total[0].total,
                    pages: Math.ceil(total[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Erreur jobs admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des offres d\'emploi'
        });
    }
});

module.exports = router;
