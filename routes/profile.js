const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = Joi.object({
    nom: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
    telephone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).optional().allow('').messages({
        'string.pattern.base': 'Format de téléphone invalide'
    }),
    bio: Joi.string().max(1000).optional().allow('').messages({
        'string.max': 'La biographie ne peut pas dépasser 1000 caractères'
    })
});

// PUT /api/profile/me - Mettre à jour le profil de l'utilisateur connecté
router.put('/me', authenticateToken, async (req, res) => {
    try {
        // Validation des données
        const { error, value } = updateProfileSchema.validate(req.body);
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

        const userId = req.user.id;
        const updates = value;

        // Mettre à jour le profil
        const updated = await db.updateUser(userId, updates);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification apportée'
            });
        }

        // Récupérer le profil mis à jour
        const updatedProfile = await db.getUserById(userId);

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                user: {
                    id: updatedProfile.id,
                    email: updatedProfile.email,
                    nom: updatedProfile.nom,
                    telephone: updatedProfile.telephone,
                    role: updatedProfile.role,
                    bio: updatedProfile.bio,
                    created_at: updatedProfile.created_at,
                    updated_at: updatedProfile.updated_at
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil',
            error: error.message
        });
    }
});

// GET /api/profile/me - Obtenir le profil de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
                user: {
                    id: user.id,
                    email: user.email,
                    nom: user.nom,
                    telephone: user.telephone,
                    role: user.role,
                    bio: user.bio,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
});

// GET /api/profile/:id - Obtenir le profil d'un utilisateur (public)
router.get('/:id', async (req, res) => {
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

        // Renvoyer uniquement les informations publiques
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    nom: user.nom,
                    role: user.role,
                    bio: user.bio,
                    created_at: user.created_at
                    // Note: email et téléphone ne sont pas inclus pour des raisons de confidentialité
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil public:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
});

module.exports = router;
