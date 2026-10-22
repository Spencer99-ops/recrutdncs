const express = require('express');
const router = express.Router();
const db = require('../src/config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware pour vérifier si l'utilisateur est un candidat
const isCandidate = (req, res, next) => {
    if (req.user.role !== 'candidat') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    next();
};

// Obtenir les statistiques d'un candidat
router.get('/stats/:id', authenticateToken, isCandidate, async (req, res) => {
    try {
        const candidateId = req.params.id;
        
        // Vérifier que l'utilisateur ne consulte que ses propres stats
        if (req.user.id !== parseInt(candidateId)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        // Compter les vues du profil (simulation - à implémenter avec une table profile_views)
        const profileViews = 0; // À implémenter avec une vraie table
        
        // Compter les offres sauvegardées par le candidat
        const savedJobs = await db.query(
            'SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = ?',
            [candidateId]
        );
        
        // Compter les candidatures du candidat
        const applications = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE user_id = ?',
            [candidateId]
        );
        
        // Compter les entretiens (candidatures avec statut 'entretien')
        const interviews = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND statut = "entretien"',
            [candidateId]
        );
        
        // Compter les messages (simulation - à implémenter avec une table messages)
        const messagesCount = 0; // À implémenter avec une vraie table

        res.json({
            success: true,
            data: {
                profileViews: profileViews,
                savedJobs: savedJobs[0].count,
                totalApplications: applications[0].count,
                interviewsCount: interviews[0].count,
                messagesCount: messagesCount
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques du candidat:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir les candidatures d'un candidat
router.get('/applications/:id', authenticateToken, isCandidate, async (req, res) => {
    try {
        const candidateId = req.params.id;
        
        // Vérifier que l'utilisateur ne consulte que ses propres candidatures
        if (req.user.id !== parseInt(candidateId)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const applications = await db.query(`
            SELECT a.*, j.titre as job_titre, j.entreprise, j.created_at as job_created_at
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
        `, [candidateId]);

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures du candidat:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir les offres sauvegardées d'un candidat
router.get('/saved-jobs/:id', authenticateToken, isCandidate, async (req, res) => {
    try {
        const candidateId = req.params.id;
        
        // Vérifier que l'utilisateur ne consulte que ses propres offres sauvegardées
        if (req.user.id !== parseInt(candidateId)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const savedJobs = await db.query(`
            SELECT j.*, sj.created_at as saved_at
            FROM saved_jobs sj
            JOIN jobs j ON sj.job_id = j.id
            WHERE sj.user_id = ?
            ORDER BY sj.created_at DESC
        `, [candidateId]);

        res.json({
            success: true,
            data: savedJobs
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des offres sauvegardées:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Sauvegarder une offre
router.post('/save-job', authenticateToken, isCandidate, async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user.id;

        // Vérifier si l'offre est déjà sauvegardée
        const existing = await db.query(
            'SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?',
            [userId, jobId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Offre déjà sauvegardée' });
        }

        // Sauvegarder l'offre
        await db.query(
            'INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)',
            [userId, jobId]
        );

        res.json({ success: true, message: 'Offre sauvegardée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'offre:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Supprimer une offre sauvegardée
router.delete('/saved-job/:jobId', authenticateToken, isCandidate, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id;

        await db.query(
            'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
            [userId, jobId]
        );

        res.json({ success: true, message: 'Offre retirée des sauvegardes' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'offre sauvegardée:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
