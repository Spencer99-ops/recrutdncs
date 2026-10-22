const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes admin nécessitent le rôle administrateur
router.use(authenticateToken, requireRole(['administrateur']));

// GET /api/admin/users - Lister tous les utilisateurs
router.get('/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();

        res.json({
            success: true,
            message: `Trouvé ${users.length} utilisateur(s)`,
            data: {
                users,
                total: users.length
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
});

// GET /api/admin/users/:id - Obtenir un utilisateur spécifique
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'ID utilisateur invalide'
            });
        }

        const user = await db.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'ID utilisateur invalide'
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Empêcher un administrateur de se supprimer lui-même
        if (userId == req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }

        const deleted = await db.deleteUser(userId);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'utilisateur'
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès',
            data: {
                deleted_user_id: userId,
                deleted_user_email: user.email
            }
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur',
            error: error.message
        });
    }
});

// GET /api/admin/stats - Statistiques du système
router.get('/stats', async (req, res) => {
    try {
        // Statistiques des utilisateurs
        const usersStats = await db.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        `);

        // Statistiques des offres
        const jobsStats = await db.query(`
            SELECT COUNT(*) as total_jobs,
                   COUNT(DISTINCT user_id) as unique_recruiters
            FROM jobs
        `);

        // Statistiques des candidatures
        const applicationsStats = await db.query(`
            SELECT statut, COUNT(*) as count 
            FROM applications 
            GROUP BY statut
        `);

        // Offres récentes
        const recentJobs = await db.query(`
            SELECT j.*, u.nom as recruteur_nom
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            ORDER BY j.created_at DESC
            LIMIT 5
        `);

        // Candidatures récentes
        const recentApplications = await db.query(`
            SELECT a.*, j.titre as job_titre, u.nom as candidat_nom
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            message: 'Statistiques récupérées avec succès',
            data: {
                users: {
                    by_role: usersStats,
                    total: usersStats.reduce((sum, stat) => sum + stat.count, 0)
                },
                jobs: jobsStats[0],
                applications: {
                    by_status: applicationsStats,
                    total: applicationsStats.reduce((sum, stat) => sum + stat.count, 0)
                },
                recent_activity: {
                    jobs: recentJobs,
                    applications: recentApplications
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
});

// GET /api/admin/jobs - Lister toutes les offres (admin)
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await db.query(`
            SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            ORDER BY j.created_at DESC
        `);

        res.json({
            success: true,
            message: `Trouvé ${jobs.length} offre(s)`,
            data: {
                jobs,
                total: jobs.length
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des offres',
            error: error.message
        });
    }
});

// DELETE /api/admin/jobs/:id - Supprimer une offre (admin)
router.delete('/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        
        if (!jobId || isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'offre invalide'
            });
        }

        // Vérifier si l'offre existe
        const job = await db.getJobById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        const deleted = await db.deleteJob(jobId);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'offre'
            });
        }

        res.json({
            success: true,
            message: 'Offre supprimée avec succès',
            data: {
                deleted_job_id: jobId,
                deleted_job_title: job.titre
            }
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'offre:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'offre',
            error: error.message
        });
    }
});

// GET /api/admin/applications - Lister toutes les candidatures (admin)
router.get('/applications', async (req, res) => {
    try {
        const applications = await db.query(`
            SELECT a.*, j.titre as job_titre, j.entreprise, u.nom as candidat_nom, u.email as candidat_email
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            message: `Trouvé ${applications.length} candidature(s)`,
            data: {
                applications,
                total: applications.length
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures',
            error: error.message
        });
    }
});

// DELETE /api/admin/applications/:id - Supprimer une candidature (admin)
router.delete('/applications/:id', async (req, res) => {
    try {
        const applicationId = req.params.id;
        
        if (!applicationId || isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de candidature invalide'
            });
        }

        // Vérifier si la candidature existe
        const application = await db.query(`
            SELECT a.*, j.titre as job_titre, u.nom as candidat_nom
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `, [applicationId]);

        if (application.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        const deleted = await db.query('DELETE FROM applications WHERE id = ?', [applicationId]);
        
        if (deleted.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la candidature'
            });
        }

        res.json({
            success: true,
            message: 'Candidature supprimée avec succès',
            data: {
                deleted_application_id: applicationId,
                deleted_application_info: application[0]
            }
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la candidature:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la candidature',
            error: error.message
        });
    }
});

module.exports = router;
