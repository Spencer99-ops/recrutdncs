const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticateToken, requireRole, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Schéma de validation pour la création d'offre
const createJobSchema = Joi.object({
    titre: Joi.string().min(3).max(200).required().messages({
        'string.min': 'Le titre doit contenir au moins 3 caractères',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères',
        'any.required': 'Titre requis'
    }),
    description: Joi.string().min(10).max(2000).required().messages({
        'string.min': 'La description doit contenir au moins 10 caractères',
        'string.max': 'La description ne peut pas dépasser 2000 caractères',
        'any.required': 'Description requise'
    }),
    requirements: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'Les prérequis ne peuvent pas dépasser 2000 caractères'
    }),
    benefits: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'Les avantages ne peuvent pas dépasser 2000 caractères'
    }),
    entreprise: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Le nom de l\'entreprise doit contenir au moins 2 caractères',
        'string.max': 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères',
        'any.required': 'Nom de l\'entreprise requis'
    }),
    location: Joi.string().min(2).max(100).required().messages({
        'string.min': 'La localisation doit contenir au moins 2 caractères',
        'string.max': 'La localisation ne peut pas dépasser 100 caractères',
        'any.required': 'Localisation requise'
    }),
    type_contrat: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel').required().messages({
        'any.only': 'Type de contrat invalide',
        'any.required': 'Type de contrat requis'
    }),
    salaire_min: Joi.number().min(0).optional().messages({
        'number.min': 'Le salaire minimum doit être positif',
        'number.base': 'Le salaire minimum doit être un nombre'
    }),
    salaire_max: Joi.number().min(0).optional().messages({
        'number.min': 'Le salaire maximum doit être positif',
        'number.base': 'Le salaire maximum doit être un nombre'
    }),
    remote: Joi.boolean().optional().default(false).messages({
        'boolean.base': 'Remote doit être un booléen'
    }),
    status: Joi.string().valid('active', 'inactive', 'draft', 'closed').optional().default('active').messages({
        'any.only': 'Statut invalide'
    })
});

// Schéma de validation pour la mise à jour d'offre
const updateJobSchema = Joi.object({
    titre: Joi.string().min(3).max(200).optional().messages({
        'string.min': 'Le titre doit contenir au moins 3 caractères',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères'
    }),
    description: Joi.string().min(10).max(2000).optional().messages({
        'string.min': 'La description doit contenir au moins 10 caractères',
        'string.max': 'La description ne peut pas dépasser 2000 caractères'
    }),
    requirements: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'Les prérequis ne peuvent pas dépasser 2000 caractères'
    }),
    benefits: Joi.string().max(2000).optional().allow('').messages({
        'string.max': 'Les avantages ne peuvent pas dépasser 2000 caractères'
    }),
    entreprise: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Le nom de l\'entreprise doit contenir au moins 2 caractères',
        'string.max': 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'
    }),
    location: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'La localisation doit contenir au moins 2 caractères',
        'string.max': 'La localisation ne peut pas dépasser 100 caractères'
    }),
    type_contrat: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel').optional().messages({
        'any.only': 'Type de contrat invalide'
    }),
    salaire_min: Joi.number().min(0).optional().messages({
        'number.min': 'Le salaire minimum doit être positif',
        'number.base': 'Le salaire minimum doit être un nombre'
    }),
    salaire_max: Joi.number().min(0).optional().messages({
        'number.min': 'Le salaire maximum doit être positif',
        'number.base': 'Le salaire maximum doit être un nombre'
    }),
    remote: Joi.boolean().optional().messages({
        'boolean.base': 'Remote doit être un booléen'
    }),
    status: Joi.string().valid('active', 'inactive', 'draft', 'closed').optional().messages({
        'any.only': 'Statut invalide'
    })
});

// GET /api/jobs - Lister les offres (accès public)
router.get('/', async (req, res) => {
    try {
        const filters = {
            location: req.query.location,
            type_contrat: req.query.type_contrat,
            titre: req.query.titre,
            entreprise: req.query.entreprise,
            remote: req.query.remote === 'true' ? true : req.query.remote === 'false' ? false : undefined
        };

        // Filtrer les valeurs vides
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        const jobs = await db.getJobs(filters);

        res.json({
            success: true,
            message: `Trouvé ${jobs.length} offre(s)`,
            data: {
                jobs,
                filters: filters,
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

// GET /api/jobs/:id - Obtenir une offre spécifique
router.get('/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        
        if (!jobId || isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'offre invalide'
            });
        }

        const job = await db.getJobById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        res.json({
            success: true,
            data: {
                job
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'offre:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'offre',
            error: error.message
        });
    }
});

// POST /api/jobs - Créer une offre (réservé recruteur/admin)
router.post('/', authenticateToken, requireRole(['recruteur', 'administrateur']), async (req, res) => {
    try {
        // Validation des données
        const { error, value } = createJobSchema.validate(req.body);
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

        const jobData = {
            ...value,
            user_id: req.user.id // L'offre est rattachée à l'utilisateur connecté
        };

        const newJob = await db.createJob(jobData);

        res.status(201).json({
            success: true,
            message: 'Offre créée avec succès',
            data: {
                job: newJob
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'offre:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'offre',
            error: error.message
        });
    }
});

// PUT /api/jobs/:id - Modifier une offre
router.put('/:id', authenticateToken, requireRole(['recruteur', 'administrateur']), requireOwnership('job'), async (req, res) => {
    try {
        const jobId = req.params.id;
        
        if (!jobId || isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'offre invalide'
            });
        }

        // Validation des données
        const { error, value } = updateJobSchema.validate(req.body);
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

        const updated = await db.updateJob(jobId, value, req.user.id);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification apportée ou offre non trouvée'
            });
        }

        // Récupérer l'offre mise à jour
        const updatedJob = await db.getJobById(jobId);

        res.json({
            success: true,
            message: 'Offre mise à jour avec succès',
            data: {
                job: updatedJob
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'offre:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'offre',
            error: error.message
        });
    }
});

// DELETE /api/jobs/:id - Supprimer une offre
router.delete('/:id', authenticateToken, requireRole(['recruteur', 'administrateur']), requireOwnership('job'), async (req, res) => {
    try {
        const jobId = req.params.id;
        
        if (!jobId || isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'offre invalide'
            });
        }

        const deleted = await db.deleteJob(jobId, req.user.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée ou vous n\'êtes pas propriétaire'
            });
        }

        res.json({
            success: true,
            message: 'Offre supprimée avec succès'
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

module.exports = router;
