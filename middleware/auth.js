const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Vérifier que l'utilisateur existe toujours
        const user = await db.getUserById(decoded.userId || decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        req.user = user;
        next();
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
            return res.status(500).json({
                success: false,
                message: 'Erreur d\'authentification',
                error: error.message
            });
        }
    }
};

// Middleware de vérification des rôles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé: rôle insuffisant',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Les administrateurs ont accès à tout
            if (userRole === 'administrateur') {
                return next();
            }

            let isOwner = false;

            switch (resourceType) {
                case 'job':
                    const job = await db.getJobById(resourceId);
                    isOwner = job && job.user_id === userId;
                    break;
                case 'application':
                    // Pour les candidats, ils ne peuvent voir que leurs propres candidatures
                    if (userRole === 'candidat') {
                        const applications = await db.getApplications('candidat', userId);
                        isOwner = applications.some(app => app.id == resourceId);
                    }
                    // Pour les recruteurs, ils peuvent voir les candidatures de leurs offres
                    else if (userRole === 'recruteur') {
                        const applications = await db.getApplications('recruteur', userId);
                        isOwner = applications.some(app => app.id == resourceId);
                    }
                    break;
                case 'profile':
                    // Les utilisateurs peuvent modifier uniquement leur propre profil
                    isOwner = resourceId == userId;
                    break;
            }

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé: vous n\'êtes pas propriétaire de cette ressource'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erreur de vérification de propriété',
                error: error.message
            });
        }
    };
};

// Fonction pour générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
        },
        JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        }
    );
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnership,
    generateToken
};
