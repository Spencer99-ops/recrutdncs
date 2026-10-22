const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile/stats - Statistiques pour le dashboard candidat
router.get('/stats', authenticateToken, requireRole('candidat'), async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Statistiques personnelles du candidat
        const personalStats = await db.query(`
            SELECT 
                COUNT(*) as total_applications,
                COUNT(CASE WHEN a.statut = 'accepte' THEN 1 END) as accepted_applications,
                COUNT(CASE WHEN a.statut = 'refuse' THEN 1 END) as rejected_applications,
                COUNT(CASE WHEN a.statut = 'entretien' THEN 1 END) as interview_applications,
                COUNT(CASE WHEN a.statut = 'en_attente' THEN 1 END) as pending_applications,
                COUNT(CASE WHEN a.statut = 'en_revue' THEN 1 END) as review_applications
            FROM applications a
            WHERE a.user_id = ?
        `, [userId]);
        
        // Applications récentes
        const recentApplications = await db.query(`
            SELECT 
                a.id,
                a.statut,
                a.created_at,
                j.titre as job_title,
                j.entreprise as company,
                j.location
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 5
        `, [userId]);
        
        // Offres recommandées (basées sur les compétences du candidat)
        const recommendedJobs = await db.query(`
            SELECT 
                j.id,
                j.titre,
                j.entreprise,
                j.location,
                j.type_contrat,
                j.salaire_min,
                j.salaire_max,
                j.created_at,
                (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
            FROM jobs j
            WHERE j.status = 'active' 
            AND j.id NOT IN (
                SELECT job_id FROM applications WHERE user_id = ?
            )
            ORDER BY j.created_at DESC
            LIMIT 6
        `, [userId]);
        
        // Profil du candidat
        const profile = await db.query(`
            SELECT 
                id,
                email,
                nom,
                prenom,
                telephone,
                bio,
                location,
                experience,
                job_title,
                skills,
                created_at
            FROM users
            WHERE id = ?
        `, [userId]);
        
        res.json({
            success: true,
            data: {
                stats: personalStats[0],
                recentApplications,
                recommendedJobs,
                profile: profile[0]
            }
        });
    } catch (error) {
        console.error('Erreur stats candidat:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// GET /api/applications/my - Mes candidatures
router.get('/my', authenticateToken, requireRole('candidat'), async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        let whereClause = 'WHERE a.user_id = ?';
        let params = [userId];
        
        if (status && status !== 'all') {
            whereClause += ' AND a.statut = ?';
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
                a.updated_at,
                j.id as job_id,
                j.titre as job_title,
                j.entreprise as company,
                j.location as job_location,
                j.type_contrat,
                j.salaire_min,
                j.salaire_max,
                j.status as job_status
            FROM applications a
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
        console.error('Erreur mes candidatures:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de vos candidatures'
        });
    }
});

// GET /api/jobs/recommended - Offres recommandées
router.get('/recommended', authenticateToken, requireRole('candidat'), async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const jobs = await db.query(`
            SELECT 
                j.id,
                j.titre,
                j.description,
                j.entreprise,
                j.location,
                j.type_contrat,
                j.salaire_min,
                j.salaire_max,
                j.requirements,
                j.created_at,
                (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count,
                CASE 
                    WHEN j.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 'new'
                    WHEN j.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 'recent'
                    ELSE 'older'
                END as freshness
            FROM jobs j
            WHERE j.status = 'active' 
            AND j.id NOT IN (
                SELECT job_id FROM applications WHERE user_id = ?
            )
            ORDER BY 
                CASE 
                    WHEN j.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1
                    WHEN j.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 2
                    ELSE 3
                END,
                j.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
        
        const total = await db.query(`
            SELECT COUNT(*) as total
            FROM jobs j
            WHERE j.status = 'active' 
            AND j.id NOT IN (
                SELECT job_id FROM applications WHERE user_id = ?
            )
        `, [userId]);
        
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
        console.error('Erreur offres recommandées:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des offres recommandées'
        });
    }
});

// GET /api/profile/me - Mon profil
router.get('/me', authenticateToken, requireRole('candidat'), async (req, res) => {
    try {
        const userId = req.user.id;
        
        const profile = await db.query(`
            SELECT 
                id,
                email,
                nom,
                prenom,
                telephone,
                bio,
                location,
                experience,
                job_title,
                skills,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
        `, [userId]);
        
        if (profile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profil non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: profile[0]
        });
    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil'
        });
    }
});

// PUT /api/profile/me - Mettre à jour mon profil
router.put('/me', authenticateToken, requireRole('candidat'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { nom, prenom, telephone, bio, location, experience, job_title, skills } = req.body;
        
        await db.query(`
            UPDATE users 
            SET nom = ?, prenom = ?, telephone = ?, bio = ?, location = ?, 
                experience = ?, job_title = ?, skills = ?, updated_at = NOW()
            WHERE id = ?
        `, [nom, prenom, telephone, bio, location, experience, job_title, skills, userId]);
        
        res.json({
            success: true,
            message: 'Profil mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
});

module.exports = router;
