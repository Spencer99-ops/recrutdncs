const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Schémas de validation Joi
const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalide',
        'any.required': 'Email requis'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Mot de passe requis'
    }),
    nom: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères',
        'any.required': 'Nom requis'
    }),
    telephone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).optional().allow('').messages({
        'string.pattern.base': 'Format de téléphone invalide'
    }),
    bio: Joi.string().max(1000).optional().allow('').messages({
        'string.max': 'La biographie ne peut pas dépasser 1000 caractères'
    }),
    role: Joi.string().valid('candidat', 'recruteur').optional().default('candidat')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalide',
        'any.required': 'Email requis'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Mot de passe requis'
    })
});

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
    try {
        // Pour les données multipart/form-data, utiliser req.body directement (multer traite les données)
        const formData = {
            email: req.body.email,
            password: req.body.password,
            nom: req.body.nom,
            telephone: req.body.telephone,
            bio: req.body.bio,
            role: req.body.role
        };
        
        // Validation des données
        const { error, value } = registerSchema.validate(formData);
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

        const { email, password, nom, telephone, bio, role } = value;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hacher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer l'utilisateur
        const newUser = await db.createUser({
            email,
            password: hashedPassword,
            nom,
            telephone,
            role,
            bio
        });

        // Générer le token JWT
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    nom: newUser.nom,
                    telephone: newUser.telephone,
                    role: newUser.role,
                    bio: newUser.bio
                },
                token
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: error.message
        });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    try {
        // Validation des données
        const { error, value } = loginSchema.validate(req.body);
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

        const { email, password } = value;

        // Vérifier si l'utilisateur existe
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer le token JWT
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    nom: user.nom,
                    telephone: user.telephone,
                    role: user.role,
                    bio: user.bio,
                    created_at: user.created_at
                },
                token
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message
        });
    }
});

// POST /api/auth/verify - Vérifier un token
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token manquant'
            });
        }

        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_key_tres_securise';
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.getUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Token valide',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    nom: user.nom,
                    telephone: user.telephone,
                    role: user.role,
                    bio: user.bio
                }
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Token invalide'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Token expiré'
            });
        } else {
            console.error('Erreur lors de la vérification du token:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification du token',
                error: error.message
            });
        }
    }
});

module.exports = router;
