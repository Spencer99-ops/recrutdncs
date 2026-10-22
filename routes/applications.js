const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const db = require('../config/database');
const { authenticateToken, requireRole, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Configuration de Multer pour l'upload des CV
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/cv');
        
        // Créer le répertoire s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accepter uniquement les fichiers PDF
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Schéma de validation pour la candidature
const applicationSchema = Joi.object({
    lettre_motivation: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'La lettre de motivation ne peut pas dépasser 2000 caractères'
    })
});

// Schéma de validation pour le changement de statut
const statusSchema = Joi.object({
    statut: Joi.string().valid('en_attente', 'entretien', 'refuse').required().messages({
        'any.only': 'Statut invalide. Valeurs possibles: en_attente, entretien, refuse',
        'any.required': 'Statut requis'
    })
});

// POST /api/apply/:jobId - Postuler à une offre (réservé candidat)
router.post('/:jobId', authenticateToken, requireRole(['candidat']), upload.single('cv'), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        
        if (!jobId || isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'offre invalide'
            });
        }

        // Vérifier que l'offre existe
        const job = await db.getJobById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        // Vérifier si le candidat n'a pas déjà postulé
        const existingApplications = await db.getApplications('candidat', req.user.id);
        const alreadyApplied = existingApplications.some(app => app.job_id == jobId);
        
        if (alreadyApplied) {
            return res.status(409).json({
                success: false,
                message: 'Vous avez déjà postulé à cette offre'
            });
        }

        // Validation des données
        const { error, value } = applicationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }))
            });
        }

        // Vérifier qu'un CV a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Le CV est requis (fichier PDF)'
            });
        }

        const applicationData = {
            job_id: jobId,
            user_id: req.user.id,
            cv_path: req.file.filename,
            lettre_motivation: value.lettre_motivation
        };

        const newApplication = await db.createApplication(applicationData);

        res.status(201).json({
            success: true,
            message: 'Candidature soumise avec succès',
            data: {
                application: newApplication,
                cv_info: {
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    size: req.file.size
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la soumission de la candidature:', error);
        
        // Supprimer le fichier uploadé en cas d'erreur
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission de la candidature',
            error: error.message
        });
    }
});

// GET /api/applications - Lister les candidatures
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        const applications = await db.getApplications(userRole, userId);

        res.json({
            success: true,
            message: `Trouvé ${applications.length} candidature(s)`,
            data: {
                applications,
                total: applications.length,
                user_role: userRole
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

// GET /api/applications/:id - Obtenir une candidature spécifique
router.get('/:id', authenticateToken, requireOwnership('application'), async (req, res) => {
    try {
        const applicationId = req.params.id;
        
        if (!applicationId || isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de candidature invalide'
            });
        }

        const applications = await db.getApplications(req.user.role, req.user.id);
        const application = applications.find(app => app.id == applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        res.json({
            success: true,
            data: {
                application
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la candidature:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la candidature',
            error: error.message
        });
    }
});

// PATCH /api/applications/:id/status - Changer le statut d'une candidature (réservé recruteur/admin)
router.patch('/:id/status', authenticateToken, requireRole(['recruteur', 'administrateur']), requireOwnership('application'), async (req, res) => {
    try {
        const applicationId = req.params.id;
        
        if (!applicationId || isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de candidature invalide'
            });
        }

        // Validation des données
        const { error, value } = statusSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }))
            });
        }

        const updated = await db.updateApplicationStatus(applicationId, value.statut, req.user.id);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée ou vous n\'avez pas les droits pour la modifier'
            });
        }

        res.json({
            success: true,
            message: 'Statut de la candidature mis à jour avec succès',
            data: {
                application_id: applicationId,
                nouveau_statut: value.statut
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
});

// GET /api/applications/:id/cv - Télécharger le CV d'une candidature
router.get('/:id/cv', authenticateToken, requireOwnership('application'), async (req, res) => {
    try {
        const applicationId = req.params.id;
        
        if (!applicationId || isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de candidature invalide'
            });
        }

        const applications = await db.getApplications(req.user.role, req.user.id);
        const application = applications.find(app => app.id == applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        const cvPath = path.join(__dirname, '../uploads/cv', application.cv_path);
        
        if (!fs.existsSync(cvPath)) {
            return res.status(404).json({
                success: false,
                message: 'Fichier CV non trouvé'
            });
        }

        res.download(cvPath, `cv-${application.candidat_nom}-${application.job_titre}.pdf`);
    } catch (error) {
        console.error('Erreur lors du téléchargement du CV:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement du CV',
            error: error.message
        });
    }
});

module.exports = router;
