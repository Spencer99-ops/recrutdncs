const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Importer les routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const adminStatsRoutes = require('./routes/admin-stats');
const profileStatsRoutes = require('./routes/profile-stats');
const jobsStatsRoutes = require('./routes/jobs-stats');
const candidateRoutes = require('./routes/candidate');
const testRoutes = require('./routes/test');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de Multer pour les uploads (désactivé pour Neon Functions, utilise memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
        }
    }
});

// Middleware avec CSP configuré pour permettre les scripts inline
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https:"],
            "img-src": ["'self'", "data:"],
            "font-src": ["'self'", "https:", "data:"],
            "connect-src": ["'self'"],
            "frame-src": ["'none'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'self'"],
            "upgrade-insecure-requests": []
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Désactiver les fichiers statiques pour Neon Functions (utilisez Vercel/Netlify pour le frontend)
// app.use(express.static(path.join(__dirname, 'public')));

// Routes API avec multer pour l'inscription
app.use('/api/auth/register', upload.single('cv'), authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profile', profileStatsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/jobs', jobsStatsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/test', testRoutes);

// Route de test
app.get('/api', (req, res) => {
    res.json({
        message: 'RECRUTDNCS API - Système de Gestion des Recrutements',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            profile: '/api/profile',
            jobs: '/api/jobs',
            applications: '/api/applications',
            admin: '/api/admin',
            candidate: '/api/candidate'
        }
    });
});

// Endpoint pour vérifier le token
app.post('/api/auth/verify', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const db = require('./src/config/database');
        
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const users = await db.query(`
            SELECT id, email, nom, telephone, role, bio, location, created_at, updated_at
            FROM users
            WHERE id = ?
        `, [decoded.userId || decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const user = users[0];
        
        res.json({
            success: true,
            user: user
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
            return res.status(500).json({
                success: false,
                message: 'Erreur d\'authentification'
            });
        }
    }
});

// Endpoint pour les jobs avec vraies données de la base de données
app.get('/api/jobs', async (req, res) => {
    try {
        const db = require('./src/config/database');
        
        const jobs = await db.query(`
            SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            WHERE j.status = 'active'
            ORDER BY j.created_at DESC
        `);
        
        res.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des jobs:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour les détails d'un job spécifique
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const jobId = req.params.id;
        
        const jobs = await db.query(`
            SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email, u.telephone as recruteur_telephone
            FROM jobs j
            LEFT JOIN users u ON j.user_id = u.id
            WHERE j.id = ? AND j.status = 'active'
        `, [jobId]);
        
        if (jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'Offre non trouvée' });
        }
        
        res.json({
            success: true,
            data: jobs[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du job:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour récupérer les informations d'un utilisateur
app.get('/api/users/:id', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const userId = req.params.id;
        
        const users = await db.query(`
            SELECT id, nom, email, telephone, role, bio, location, created_at, updated_at
            FROM users
            WHERE id = ?
        `, [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        const user = users[0];
        
        if (user.role === 'candidat') {
            const skills = await db.query(`
                SELECT skill_name FROM user_skills WHERE user_id = ?
            `, [userId]);
            user.skills = skills.map(s => s.skill_name);
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

// Endpoint pour le profil utilisateur avec vraies données
app.get('/api/profile/:id', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const userId = req.params.id;
        
        const users = await db.query(`
            SELECT id, nom, email, telephone, role, bio, location, created_at, updated_at
            FROM users
            WHERE id = ?
        `, [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        const user = users[0];
        
        if (user.role === 'candidat') {
            const skills = await db.query(`
                SELECT skill_name FROM user_skills WHERE user_id = ?
            `, [userId]);
            user.skills = skills.map(s => s.skill_name);
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour mettre à jour le profil utilisateur
app.put('/api/profile/:id', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const userId = req.params.id;
        const { nom, email, telephone, adresse, ville, bio, skills } = req.body;
        
        await db.query(`
            UPDATE users 
            SET nom = ?, email = ?, telephone = ?, adresse = ?, ville = ?, bio = ?, updated_at = NOW()
            WHERE id = ?
        `, [nom, email, telephone, adresse, ville, bio, userId]);
        
        if (skills && Array.isArray(skills)) {
            await db.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
            
            for (const skill of skills) {
                await db.query('INSERT INTO user_skills (user_id, skill_name) VALUES ($1, $2)', [userId, skill]);
            }
        }
        
        res.json({
            success: true,
            message: 'Profil mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour obtenir l'utilisateur courant
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token d\'authentification manquant' });
        }
        
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            const user = {
                id: decoded.id || decoded.userId || 33,
                email: 'jean.dupont@email.com',
                nom: 'Dupont',
                role: 'candidat',
                telephone: '+33 6 12 34 56 78'
            };
            
            res.json({
                success: true,
                data: user
            });
        } catch (jwtError) {
            return res.status(403).json({ success: false, message: 'Token invalide' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur courant:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour les candidatures
app.get('/api/applications', async (req, res) => {
    try {
        const db = require('./src/config/database');
        
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token d\'authentification manquant' });
        }
        
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const userRole = decoded.role;
        const userId = decoded.id || decoded.userId;
        
        let applications;
        
        switch (userRole) {
            case 'candidat':
                applications = await db.query(`
                    SELECT a.*, j.titre as job_titre, j.entreprise, j.location, j.type_contrat, j.salaire_min, j.salaire_max
                    FROM applications a
                    JOIN jobs j ON a.job_id = j.id
                    WHERE a.user_id = ?
                    ORDER BY a.created_at DESC
                `, [userId]);
                break;
                
            case 'recruteur':
                applications = await db.query(`
                    SELECT a.*, u.nom as candidat_nom, u.email as candidat_email, u.telephone as candidat_telephone,
                           j.titre as job_titre, j.entreprise
                    FROM applications a
                    JOIN users u ON a.user_id = u.id
                    JOIN jobs j ON a.job_id = j.id
                    WHERE j.user_id = ?
                    ORDER BY a.created_at DESC
                `, [userId]);
                break;
                
            case 'administrateur':
                applications = await db.query(`
                    SELECT a.*, u.nom as candidat_nom, u.email as candidat_email, u.role as candidat_role,
                           j.titre as job_titre, j.entreprise, r.nom as recruteur_nom
                    FROM applications a
                    JOIN users u ON a.user_id = u.id
                    JOIN jobs j ON a.job_id = j.id
                    LEFT JOIN users r ON j.user_id = r.id
                    ORDER BY a.created_at DESC
                `);
                break;
                
            default:
                return res.status(403).json({ success: false, message: 'Rôle non autorisé' });
        }
        
        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Endpoint pour créer une candidature
app.post('/api/applications', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const { job_id, user_id } = req.body;
        
        const user = await db.getUserById(user_id);
        if (!user || user.role !== 'candidat') {
            return res.status(403).json({ success: false, message: 'Seuls les candidats peuvent postuler' });
        }
        
        const existing = await db.query(
            'SELECT * FROM applications WHERE user_id = ? AND job_id = ?',
            [user_id, job_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Vous avez déjà postulé à cette offre' });
        }
        
        await db.query(
            'INSERT INTO applications (user_id, job_id, statut, created_at) VALUES (?, ?, ?, NOW())',
            [user_id, job_id, 'en_attente']
        );
        
        res.json({
            success: true,
            message: 'Candidature envoyée avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la création de la candidature:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Gestion des erreurs 404 pour les routes API
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API non trouvé',
        path: req.originalUrl
    });
});

// Gestion des erreurs 404 générales
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ressource non trouvée',
        path: req.originalUrl
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('=== ERREUR GLOBALE INTERCEPTÉE ===');
    console.error('URL:', req.originalUrl);
    console.error('Méthode:', req.method);
    console.error('Erreur:', err.message);
    console.error('Stack trace:', err.stack);
    
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
        error: err.message,
        stack: err.stack
    });
});

// Export pour Neon Functions avec interface Fetch
module.exports = {
    async fetch(request) {
        // Convertir la requête Fetch en requête Express-compatible
        const url = new URL(request.url);
        const method = request.method;
        const headers = {};
        
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        
        let body;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.text();
            try {
                body = JSON.parse(body);
            } catch (e) {
                // Keep as text if not JSON
            }
        }
        
        // Créer un objet req simulé
        const mockReq = {
            method,
            url: url.pathname + url.search,
            path: url.pathname,
            query: Object.fromEntries(url.searchParams),
            headers,
            body,
            get: (key) => headers[key.toLowerCase()]
        };
        
        // Créer un objet res simulé
        let statusCode = 200;
        let responseData = null;
        const mockRes = {
            status: (code) => {
                statusCode = code;
                return mockRes;
            },
            json: (data) => {
                responseData = data;
                return mockRes;
            },
            send: (data) => {
                responseData = data;
                return mockRes;
            },
            setHeader: () => mockRes,
            getHeader: () => null
        };
        
        // Exécuter l'application Express
        return new Promise((resolve) => {
            app(mockReq, mockRes, () => {
                const response = new Response(
                    typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
                    {
                        status: statusCode,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        }
                    }
                );
                resolve(response);
            });
        });
    }
};
