const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs/stats - Statistiques pour le dashboard recruteur
router.get('/stats', authenticateToken, requireRole('recruteur'), async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Statistiques personnelles du recruteur
        const personalStats = await db.query(`
            SELECT 
                COUNT(*) as total_jobs,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_jobs,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_jobs,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ?) as total_applications,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ? AND a.statut = 'en_attente') as pending_applications,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ? AND a.statut = 'en_revue') as review_applications,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ? AND a.statut = 'entretien') as interview_applications,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ? AND a.statut = 'accepte') as accepted_applications,
                (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.user_id = ? AND a.statut = 'refuse') as rejected_applications
            FROM jobs
            WHERE user_id = ?
        `, [userId, userId, userId, userId, userId, userId, userId]);
        
        // Applications récentes pour mes offres
        const recentApplications = await db.query(`
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
                u.bio as candidate_bio,
                u.skills as candidate_skills,
                u.experience as candidate_experience,
                j.id as job_id,
                j.titre as job_title
            FROM applications a
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE j.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 10
        `, [userId]);
        
        // Mes offres récentes
        const myJobs = await db.query(`
            SELECT 
                id,
                titre,
                entreprise,
                location,
                type_contrat,
                salaire_min,
                salaire_max,
                status,
                created_at,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id) as application_count,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id AND statut = 'en_attente') as pending_count
            FROM jobs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `, [userId]);
        
        // Statistiques mensuelles des candidatures
        const monthlyApplications = await db.query(`
            SELECT 
                DATE_FORMAT(a.created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.user_id = ? AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(a.created_at, '%Y-%m')
            ORDER BY month
        `, [userId]);
        
        res.json({
            success: true,
            data: {
                stats: personalStats[0],
                recentApplications,
                myJobs,
                monthlyApplications
            }
        });
    } catch (error) {
        console.error('Erreur stats recruteur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// GET /api/jobs/my - Mes offres d'emploi
router.get('/my', authenticateToken, requireRole('recruteur'), async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        let whereClause = 'WHERE user_id = ?';
        let params = [userId];
        
        if (status && status !== 'all') {
            whereClause += ' AND status = ?';
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
                requirements,
                benefits,
                status,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id) as application_count,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id AND statut = 'en_attente') as pending_count,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id AND statut = 'entretien') as interview_count,
                (SELECT COUNT(*) FROM applications WHERE job_id = jobs.id AND statut = 'accepte') as accepted_count
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
        console.error('Erreur mes offres:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de vos offres d\'emploi'
        });
    }
});

// GET /api/applications/job/:jobId - Candidatures pour une offre spécifique
router.get('/applications/job/:jobId', authenticateToken, requireRole('recruteur'), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id;
        
        // Vérifier que l'offre appartient bien au recruteur
        const job = await db.query('SELECT id, titre FROM jobs WHERE id = ? AND user_id = ?', [jobId, userId]);
        
        if (job.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Offre d\'emploi non trouvée'
            });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        let whereClause = 'WHERE a.job_id = ?';
        let params = [jobId];
        
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
                u.id as user_id,
                u.nom as candidate_name,
                u.prenom as candidate_prenom,
                u.email as candidate_email,
                u.telephone as candidate_phone,
                u.bio as candidate_bio,
                u.skills as candidate_skills,
                u.experience as candidate_experience,
                u.location as candidate_location,
                u.job_title as candidate_job_title,
                u.created_at as candidate_registered_at
            FROM applications a
            JOIN users u ON a.user_id = u.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        const total = await db.query(`
            SELECT COUNT(*) as total
            FROM applications a
            ${whereClause}
        `, params);
        
        // Statistiques pour cette offre
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as pending,
                COUNT(CASE WHEN statut = 'en_revue' THEN 1 END) as review,
                COUNT(CASE WHEN statut = 'entretien' THEN 1 END) as interview,
                COUNT(CASE WHEN statut = 'accepte' THEN 1 END) as accepted,
                COUNT(CASE WHEN statut = 'refuse' THEN 1 END) as rejected
            FROM applications
            WHERE job_id = ?
        `, [jobId]);
        
        res.json({
            success: true,
            data: {
                job: job[0],
                applications,
                stats: stats[0],
                pagination: {
                    page,
                    limit,
                    total: total[0].total,
                    pages: Math.ceil(total[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Erreur candidatures offre:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures'
        });
    }
});

// PUT /api/applications/:id/status - Mettre à jour le statut d'une candidature
router.put('/applications/:id/status', authenticateToken, requireRole('recruteur'), async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { statut, feedback, interview_date } = req.body;
        const userId = req.user.id;
        
        // Vérifier que la candidature appartient bien à une offre du recruteur
        const checkQuery = `
            SELECT a.id 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ? AND j.user_id = ?
        `;
        
        const checkResult = await db.query(checkQuery, [applicationId, userId]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }
        
        // Mettre à jour le statut
        await db.query(`
            UPDATE applications 
            SET statut = ?, feedback = ?, interview_date = ?, updated_at = NOW()
            WHERE id = ?
        `, [statut, feedback || null, interview_date || null, applicationId]);
        
        res.json({
            success: true,
            message: 'Statut de la candidature mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour statut candidature:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut'
        });
    }
});

module.exports = router;
