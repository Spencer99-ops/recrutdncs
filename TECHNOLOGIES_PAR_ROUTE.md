# TECHNOLOGIES UTILISÉES PAR ROUTE - RECRUTDNCS

Ce document détaille les technologies spécifiques utilisées pour chaque route et opération du système RECRUTDNCS.

---

## ARCHITECTURE GLOBALE

### Stack Technique Principal
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.2.1)
- **Base de données**: MySQL (via mysql2 v3.22.0)
- **Authentification**: JWT (jsonwebtoken v9.0.3)
- **Sécurité**: Bcrypt (v6.0.0), Helmet (v8.1.0)
- **Validation**: Joi (v18.1.2)
- **Upload de fichiers**: Multer (v2.1.1)
- **HTTP Client**: Axios (v1.15.0), node-fetch (v2.7.0)

---

## A. AUTHENTIFICATION ET PROFILS (3 endpoints)

### Route 1 - POST /api/auth/register
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP POST
- **Multer**: Middleware pour gérer les données `multipart/form-data` (upload CV)
- **Joi**: Validation des données d'inscription (email, mot de passe, nom)
- **Bcrypt**: Hachage du mot de passe (salt rounds: 10)
- **MySQL2**: Insertion de l'utilisateur dans la base de données
- **File System**: Sauvegarde des fichiers uploadés dans `/uploads/`

**Opérations:**
```javascript
// Validation Joi
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    nom: Joi.string().min(2).max(100).required()
});

// Hachage Bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Insertion MySQL2
await db.query('INSERT INTO users SET ?', userData);
```

### Route 2 - POST /api/auth/login
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP POST
- **Joi**: Validation des identifiants de connexion
- **Bcrypt**: Comparaison du mot de passe hashé
- **JWT**: Génération du token d'authentification
- **MySQL2**: Recherche de l'utilisateur dans la base

**Opérations:**
```javascript
// Validation Joi
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Vérification Bcrypt
const isValid = await bcrypt.compare(password, user.password);

// Génération JWT
const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
```

### Route 3 - PUT /api/profile/:id
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP PUT
- **JWT Middleware**: Vérification du token d'authentification
- **Joi**: Validation des données de profil
- **MySQL2**: Mise à jour des informations utilisateur

**Opérations:**
```javascript
// Middleware JWT
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);

// Validation Joi
const profileSchema = Joi.object({
    nom: Joi.string().min(2).max(100),
    telephone: Joi.string().pattern(/^[0-9+\-\s()]+$/),
    bio: Joi.string().max(1000)
});

// Mise à jour MySQL2
await db.query('UPDATE users SET ? WHERE id = ?', [updateData, userId]);
```

---

## B. GESTION DES OFFRES (JOBS) (4 endpoints)

### Route 4 - GET /api/jobs
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP GET
- **MySQL2**: Recherche multicritères dans la base de données
- **Query Parameters**: Filtrage (location, type_contrat, recherche)

**Opérations:**
```javascript
// Construction dynamique de la requête
let query = 'SELECT * FROM jobs WHERE status = "active"';
const params = [];

if (location) {
    query += ' AND location LIKE ?';
    params.push(`%${location}%`);
}

// Exécution MySQL2
const jobs = await db.query(query, params);
```

### Route 5 - POST /api/jobs
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP POST
- **JWT Middleware**: Vérification du token (rôle recruteur/admin)
- **Joi**: Validation des données de l'offre
- **MySQL2**: Insertion de la nouvelle offre

**Opérations:**
```javascript
// Validation Joi
const createJobSchema = Joi.object({
    titre: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    entreprise: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(100).required(),
    type_contrat: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel').required()
});

// Insertion MySQL2
const result = await db.query('INSERT INTO jobs SET ?', jobData);
```

### Route 6 - PUT /api/jobs/:jobId
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP PUT
- **JWT Middleware**: Vérification des permissions
- **Joi**: Validation des données de modification
- **MySQL2**: Mise à jour de l'offre

**Opérations:**
```javascript
// Vérification propriétaire
const job = await db.query('SELECT user_id FROM jobs WHERE id = ?', [jobId]);
if (job.user_id !== userId && userRole !== 'administrateur') {
    return res.status(403).json({ message: 'Non autorisé' });
}

// Mise à jour MySQL2
await db.query('UPDATE jobs SET ? WHERE id = ?', [updateData, jobId]);
```

### Route 7 - DELETE /api/jobs/:jobId
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP DELETE
- **JWT Middleware**: Vérification des permissions
- **MySQL2**: Suppression de l'offre (DELETE CASCADE)

**Opérations:**
```javascript
// Vérification permissions
if (job.user_id !== userId && userRole !== 'administrateur') {
    return res.status(403).json({ message: 'Non autorisé' });
}

// Suppression MySQL2 (avec CASCADE)
await db.query('DELETE FROM jobs WHERE id = ?', [jobId]);
```

---

## C. GESTION DES CANDIDATURES (APPLICATIONS) (3 endpoints)

### Route 8 - POST /api/apply/:jobId
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP POST
- **Multer**: Upload du fichier CV (PDF, max 5MB)
- **JWT Middleware**: Vérification du rôle candidat
- **MySQL2**: Création de la candidature
- **File System**: Sauvegarde du CV

**Opérations:**
```javascript
// Configuration Multer
const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/cv/',
        filename: (req, file, cb) => {
            cb(null, `cv_${userId}_${Date.now()}.pdf`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisés'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Insertion MySQL2
await db.query('INSERT INTO applications SET ?', {
    job_id: jobId,
    user_id: userId,
    cv_path: `/uploads/cv/${filename}`,
    statut: 'en_attente'
});
```

### Route 9 - GET /api/applications
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP GET
- **JWT Middleware**: Vérification de l'authentification
- **MySQL2**: Requêtes adaptées selon le rôle
- **JOIN SQL**: Relations entre tables

**Opérations:**
```javascript
// Selon le rôle
switch (userRole) {
    case 'candidat':
        applications = await db.query(`
            SELECT a.*, j.titre, j.entreprise 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.user_id = ?
        `, [userId]);
        break;
        
    case 'recruteur':
        applications = await db.query(`
            SELECT a.*, u.nom, u.email 
            FROM applications a
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE j.user_id = ?
        `, [userId]);
        break;
}
```

### Route 10 - PATCH /api/applications/:id/status
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP PATCH
- **JWT Middleware**: Vérification du rôle recruteur/admin
- **Joi**: Validation du statut
- **MySQL2**: Mise à jour du statut

**Opérations:**
```javascript
// Validation Joi
const statusSchema = Joi.object({
    statut: Joi.string().valid('en_attente', 'en_revue', 'entretien', 'accepte', 'refuse').required(),
    feedback: Joi.string().max(1000).optional(),
    interview_date: Joi.date().optional()
});

// Mise à jour MySQL2
await db.query('UPDATE applications SET ? WHERE id = ?', [updateData, applicationId]);
```

---

## D. ADMINISTRATION ET MODÉRATION (2 endpoints)

### Route 11 - GET /api/admin/users
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP GET
- **JWT Middleware**: Vérification du rôle administrateur
- **MySQL2**: Requête avec pagination
- **Aggregate Functions**: Statistiques

**Opérations:**
```javascript
// Vérification rôle admin
if (userRole !== 'administrateur') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
}

// Requête MySQL2 avec pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

const users = await db.query(`
    SELECT id, email, nom, role, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
`, [limit, offset]);
```

### Route 12 - DELETE /api/admin/users/:id
**Technologies utilisées:**
- **Express.js**: Gestion de la route HTTP DELETE
- **JWT Middleware**: Vérification du rôle administrateur
- **MySQL2**: Suppression avec CASCADE
- **Foreign Key Constraints**: Maintien de l'intégrité

**Opérations:**
```javascript
// Vérification rôle admin
if (userRole !== 'administrateur') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
}

// Suppression MySQL2 (CASCADE automatique)
await db.query('DELETE FROM users WHERE id = ?', [userId]);
```

---

## E. MIDDLEWARES ET SÉCURITÉ

### JWT Authentication Middleware
**Technologies:**
- **jsonwebtoken**: Décodage et vérification des tokens
- **dotenv**: Gestion des variables d'environnement
- **Express**: Intégration middleware

```javascript
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token requis' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
};
```

### Role-Based Access Control
**Technologies:**
- **Express**: Middleware de vérification de rôle
- **JWT**: Extraction du rôle depuis le token

```javascript
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Rôle non autorisé' });
        }
        next();
    };
};
```

### Validation Middleware
**Technologies:**
- **Joi**: Schémas de validation
- **Express**: Intégration middleware

```javascript
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Données invalides',
                errors: error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }))
            });
        }
        req.body = value;
        next();
    };
};
```

---

## F. BASE DE DONNÉES ET ORM

### MySQL2 Configuration
**Technologies:**
- **mysql2**: Driver MySQL avec support Promise
- **Connection Pooling**: Gestion des connexions
- **Prepared Statements**: Protection contre injection SQL

```javascript
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

### Transactions
**Technologies:**
- **MySQL2**: Support des transactions
- **Express**: Gestion des erreurs de transaction

```javascript
const connection = await db.getConnection();
try {
    await connection.beginTransaction();
    
    await connection.execute('INSERT INTO applications SET ?', applicationData);
    await connection.execute('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?', [jobId]);
    
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}
```

---

## G. FRONTEND ET CLIENT

### JavaScript Vanilla
**Technologies:**
- **Fetch API**: Requêtes HTTP
- **LocalStorage**: Stockage des tokens
- **DOM Manipulation**: Interface dynamique

```javascript
// Requête API avec Fetch
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const response = await fetch(`/api${endpoint}`, { ...defaultOptions, ...options });
    return await response.json();
}
```

### File Upload
**Technologies:**
- **FormData**: Construction des données multipart
- **Fetch**: Upload de fichiers

```javascript
// Upload de CV
const formData = new FormData();
formData.append('cv', fileInput.files[0]);
formData.append('jobId', jobId);

const response = await fetch('/api/apply/' + jobId, {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

## H. DÉPLOIEMENT ET INFRASTRUCTURE

### Environment Configuration
**Technologies:**
- **dotenv**: Gestion des variables d'environnement
- **Node.js**: Process environment

```javascript
// .env configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recrutdncs
JWT_SECRET=votre_secret_jwt
PORT=3000
UPLOAD_PATH=./uploads
```

### File System Management
**Technologies:**
- **Node.js fs**: Opérations sur les fichiers
- **Multer**: Upload et stockage
- **Path**: Manipulation des chemins

```javascript
const path = require('path');
const fs = require('fs');

// Vérification et création des dossiers
const uploadDir = path.join(__dirname, 'uploads', 'cv');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
```

---

## RÉSUMÉ DES TECHNOLOGIES PAR CATÉGORIE

| Catégorie | Technologies Principales | Utilisation |
|-----------|-------------------------|-------------|
| **Backend** | Node.js, Express.js | Serveur HTTP, routing |
| **Base de données** | MySQL, MySQL2 | Stockage persistant |
| **Authentification** | JWT, Bcrypt | Sécurité, tokens |
| **Validation** | Joi | Validation des données |
| **Upload** | Multer, fs | Gestion des fichiers |
| **Frontend** | JavaScript Vanilla, Fetch API | Interface utilisateur |
| **Sécurité** | Helmet, Bcrypt | Protection HTTP |
| **Environment** | dotenv, process.env | Configuration |
| **HTTP Client** | Axios, node-fetch | Requêtes externes |
| **Middleware** | Express middleware | Pipeline de traitement |

---

Ce document illustre comment chaque technologie est spécifiquement utilisée dans les différentes opérations du système RECRUTDNCS, assurant une architecture cohérente et maintenable.
