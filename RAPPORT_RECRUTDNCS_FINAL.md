KEYCE INFORMATIQUE & INTELLIGENCE ARTIFICIELLE
Filière : Développement Logiciel & Réseaux


THÈME :
API REST DE GESTION DES RECRUTEMENTS (RECRUTDNCS)
Système Backend ATS complet avec Frontend Web


Réalisé par :
Regonne Spencer Christopher
Nyemeck Charles Stephane
Nguime Nguime Josue Landry
Ngono Alima Danielle-Fortune

Encadré par :
Mr TOBOU (Enseignant)

Année académique 2025 - 2026

---

## TABLE DES MATIÈRES

I. PRÉSENTATION DU PROJET
1. Contexte du Projet
2. Objectifs
3. Architecture Technique

II. LOGIQUE MÉTIER & SYSTÈME DE RÔLES
1. Acteurs du système
2. Règles de Gestion

III. MODÉLISATION DE LA BASE DE DONNÉES
1. Schéma Relationnel
   - Table : users
   - Table : jobs (Offres d'emploi)
   - Table : applications (Candidatures)

IV. DOCUMENTATION DES 12 ENDPOINTS API

A. AUTHENTIFICATION ET PROFILS (3 endpoints)
   - Route 1 - POST /api/auth/register
   - Route 2 - POST /api/auth/login
   - Route 3 - PUT /api/profile/:id

B. GESTION DES OFFRES (JOBS) (4 endpoints)
   - Route 4 - GET /api/jobs
   - Route 5 - POST /api/jobs
   - Route 6 - PUT /api/jobs/:jobId
   - Route 7 - DELETE /api/jobs/:jobId

C. GESTION DES CANDIDATURES (APPLICATIONS) (3 endpoints)
   - Route 8 - POST /api/apply/:jobId
   - Route 9 - GET /api/applications
   - Route 10 - PATCH /api/applications/:id/status

D. ADMINISTRATION ET MODÉRATION (2 endpoints)
   - Route 11 - GET /api/admin/users
   - Route 12 - DELETE /api/admin/users/:id

V. INTERFACE UTILISATEUR (FRONTEND)
1. Pages HTML dynamiques
2. Rôles et interfaces spécifiques

VI. GUIDE DE DÉPLOIEMENT
1. Prérequis
2. Installation
3. Configuration du fichier .env
4. Démarrage du serveur

VII. CONCLUSION

---

## I. PRÉSENTATION DU PROJET

### 1. Contexte du Projet
RECRUTDNCS est une API REST conçue pour automatiser et sécuriser le flux de recrutement au sein d'une organisation. Elle permet de gérer le cycle de vie complet d'une embauche : de la publication de l'offre par un recruteur à la gestion des utilisateurs par un administrateur, en passant par le dépôt de candidature (avec CV) par un candidat.

### 2. Objectifs
- Automatiser et sécuriser le processus de recrutement
- Gérer les offres d'emploi, les candidatures et les utilisateurs
- Implémenter une authentification robuste avec JWT
- Fournir une interface utilisateur complète et intuitive
- Respecter les exigences du cahier des charges (12 endpoints minimum)

### 3. Architecture Technique
- **Environnement de développement** : Laragon (Serveur local)
- **Langage & Framework** : Node.js / Express.js
- **Base de données** : MySQL (Gestion via HeidiSQL)
- **Authentification** : JWT (JSON Web Token)
- **Sécurité** : Hachage des mots de passe avec Bcrypt, validation avec Joi
- **Stockage fichiers** : Gestion des fichiers PDF (CV) via le middleware Multer

---

## II. LOGIQUE MÉTIER & SYSTÈME DE RÔLES

### 1. Acteurs du système
L'application repose sur trois niveaux d'autorisation strictement définis :

- **Candidat** : Peut consulter les offres, gérer son profil et postuler
- **Recruteur** : Peut créer des offres, gérer ses propres publications et évaluer les candidats
- **Administrateur** : Super-utilisateur ayant un droit de regard et de modification sur l'intégralité de la base de données

### 2. Règles de Gestion
- Un candidat ne peut pas postuler deux fois à la même offre
- Seul le créateur d'une offre (ou l'Admin) peut la modifier ou la supprimer
- Le statut d'une candidature évolue de "en_attente" vers "entretien" ou "refuse"
- L'accès aux routes sensibles est protégé par token JWT
- Les documents uploadés sont limités à 5MB et au format PDF
- Les mots de passe doivent contenir au minimum 6 caractères

---

## III. MODÉLISATION DE LA BASE DE DONNÉES

### 1. Schéma Relationnel
La base de données MySQL comporte les tables principales suivantes :

#### Table : users
| Champ | Type | Contraintes | Description |
|-------|------|------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identifiant unique |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Adresse email |
| password | VARCHAR(255) | NOT NULL | Mot de passe hashé (Bcrypt) |
| nom | VARCHAR(100) | NOT NULL | Nom complet |
| prenom | VARCHAR(100) | NULL | Prénom |
| telephone | VARCHAR(20) | NULL | Téléphone |
| role | ENUM | NOT NULL DEFAULT 'candidat' | candidat / recruteur / administrateur |
| bio | TEXT | NULL | Biographie |
| location | VARCHAR(255) | NULL | Localisation du candidat |
| experience | VARCHAR(20) | NULL | Niveau d'expérience |
| job_title | VARCHAR(200) | NULL | Titre de poste actuel |
| skills | TEXT | NULL | Compétences |
| avatar_path | VARCHAR(255) | NULL | Chemin de l'avatar |
| cv_path | VARCHAR(255) | NULL | Chemin du CV |
| company_name | VARCHAR(100) | NULL | Nom de l'entreprise (recruteur) |
| company_sector | VARCHAR(100) | NULL | Secteur d'activité |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de modification |

#### Table : jobs (Offres d'emploi)
| Champ | Type | Contraintes | Description |
|-------|------|------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identifiant unique |
| titre | VARCHAR(200) | NOT NULL | Intitulé du poste |
| description | TEXT | NOT NULL | Détail du poste |
| requirements | TEXT | NULL | Exigences du poste |
| benefits | TEXT | NULL | Avantages offerts |
| entreprise | VARCHAR(100) | NOT NULL | Nom de l'entreprise |
| location | VARCHAR(100) | NOT NULL | Ville / localisation |
| type_contrat | ENUM | NOT NULL | CDI, CDD, Stage, Alternance, Freelance, Temps partiel |
| salaire_min | DECIMAL(10,2) | NULL | Salaire minimum |
| salaire_max | DECIMAL(10,2) | NULL | Salaire maximum |
| remote | BOOLEAN | DEFAULT FALSE | Télétravail possible |
| user_id | INT | NOT NULL, FK | Recruteur créateur |
| status | ENUM | DEFAULT 'active' | active / inactive / draft / closed |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de publication |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de modification |

#### Table : applications (Candidatures)
| Champ | Type | Contraintes | Description |
|-------|------|------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identifiant unique |
| job_id | INT | NOT NULL, FK | Offre concernée |
| user_id | INT | NOT NULL, FK | Candidat |
| cv_path | VARCHAR(255) | NULL | Chemin du fichier CV |
| cover_letter_path | VARCHAR(255) | NULL | Chemin de la lettre de motivation |
| message_motivation | TEXT | NULL | Message de motivation |
| statut | ENUM | DEFAULT 'en_attente' | en_attente / en_revue / entretien / accepte / refuse |
| interview_date | DATETIME | NULL | Date d'entretien |
| feedback | TEXT | NULL | Feedback du recruteur |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de candidature |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de modification |
| **UNIQUE KEY** | unique_application | (job_id, user_id) | Unicité candidat/offre |

---

## IV. DOCUMENTATION DES 12 ENDPOINTS API

L'API RECRUTDNCS expose exactement **12 endpoints RESTful** conformément au cahier des charges. Chaque requête nécessitant une authentification doit inclure le header HTTP suivant :

```
Authorization: Bearer <token_jwt>
```

### A. AUTHENTIFICATION ET PROFILS (3 endpoints)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 1 | POST | /api/auth/register | Inscription - Création de compte | Public |
| 2 | POST | /api/auth/login | Connexion - Génération Token JWT | Public |
| 3 | PUT | /api/profile/:id | Mise à jour du Profil | Connecté |

#### Route 1 - POST /api/auth/register
Cette route permet à tout visiteur de créer un compte sur la plateforme. Logique : Vérification d'unicité de l'email, hachage du mot de passe, attribution du rôle par défaut.

**POST /api/auth/register**
```json
Body (multipart/form-data): { 
    "nom": "Jean Dupont", 
    "email": "jean@mail.com", 
    "password": "motdepasse123", 
    "role": "candidat",
    "cv": <fichier_cv.pdf>
}
Réponse 201: { 
    "success": true,
    "message": "Utilisateur créé avec succès",
    "user": { "id": 1, "nom": "Jean Dupont", "email": "jean@mail.com", "role": "candidat" }
}
```

#### Route 2 - POST /api/auth/login
Cette route permet à un utilisateur enregistré de se connecter. Génération d'un Token JWT contenant l'ID et le rôle de l'utilisateur.

**POST /api/auth/login**
```json
Body: { "email": "jean@mail.com", "password": "motdepasse123" }
Réponse 200: { 
    "success": true,
    "message": "Connexion réussie",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "nom": "Jean Dupont", "email": "jean@mail.com", "role": "candidat" }
}
```

#### Route 3 - PUT /api/profile/:id
Permet à l'utilisateur connecté de modifier ses informations (nom, téléphone, bio).

**PUT /api/profile/:id**
```json
Header: Authorization: Bearer <token>
Body: { 
    "nom": "Jean Dupont Jr", 
    "telephone": "+237 6XX XXX XXX", 
    "bio": "Développeur Node.js" 
}
Réponse 200: { 
    "success": true,
    "message": "Profil mis à jour avec succès",
    "data": { "id": 1, "nom": "Jean Dupont Jr", "telephone": "+237 6XX XXX XXX", "bio": "Développeur Node.js" }
}
```

### B. GESTION DES OFFRES (JOBS) (4 endpoints)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 4 | GET | /api/jobs | Lister les Offres - Accès public | Public |
| 5 | POST | /api/jobs | Créer une Offre - Réservé Recruteur/Admin | Recruteur / Admin |
| 6 | PUT | /api/jobs/:jobId | Modifier une Offre - Réservé au propriétaire ou à l'Admin | Recruteur / Admin |
| 7 | DELETE | /api/jobs/:jobId | Supprimer une Offre - Réservé au créateur ou à l'Admin | Recruteur / Admin |

#### Route 4 - GET /api/jobs
Accès public. Logique : Recherche multicritères (par ville, type de contrat ou titre).

**GET /api/jobs?location=Douala&type_contrat=CDI**
```json
Réponse 200: { 
    "success": true,
    "data": [
        { "id": 1, "titre": "Développeur Node.js", "location": "Douala", "type_contrat": "CDI", ... }, 
        ...
    ]
}
```

#### Route 5 - POST /api/jobs
Réservé Recruteur/Admin. L'offre est rattachée à l'ID de l'utilisateur créateur.

**POST /api/jobs**
```json
Header: Authorization: Bearer <token_recruteur>
Body: { 
    "titre": "Dev Backend", 
    "description": "Développement backend Node.js", 
    "entreprise": "Tech Corp", 
    "location": "Yaoundé", 
    "type_contrat": "CDI" 
}
Réponse 201: { 
    "success": true,
    "message": "Offre créée avec succès",
    "data": { "id": 5, "titre": "Dev Backend", "user_id": 3, "created_at": "2026-04-17..." }
}
```

#### Route 6 - PUT /api/jobs/:jobId
Réservé au propriétaire de l'offre ou à l'Admin.

**PUT /api/jobs/5**
```json
Header: Authorization: Bearer <token>
Body: { "titre": "Développeur Backend Senior", "location": "Douala" }
Réponse 200: { 
    "success": true,
    "message": "Offre mise à jour avec succès",
    "data": { "id": 5, "titre": "Développeur Backend Senior", ... }
}
```

#### Route 7 - DELETE /api/jobs/:jobId
Suppression physique ou logique de l'offre. Réservé au créateur ou à l'Admin.

**DELETE /api/jobs/5**
```json
Header: Authorization: Bearer <token_recruteur>
Réponse 200: { 
    "success": true,
    "message": "Offre supprimée avec succès"
}
```

### C. GESTION DES CANDIDATURES (APPLICATIONS) (3 endpoints)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 8 | POST | /api/apply/:jobId | Postuler - Réservé Candidat. Upload du CV (PDF) | Candidat |
| 9 | GET | /api/applications | Lister les Candidatures - Adapté selon le rôle | Tous |
| 10 | PATCH | /api/applications/:id/status | Changer le Statut - Réservé Recruteur/Admin | Recruteur / Admin |

#### Route 8 - POST /api/apply/:jobId
Réservé Candidat. Logique : Upload du CV (PDF), lien entre l'utilisateur, l'offre et le fichier.

**POST /api/apply/5**
```json
Header: Authorization: Bearer <token_candidat>
Body (multipart/form-data): { cv: <fichier_cv.pdf> }
Réponse 201: { 
    "success": true,
    "message": "Candidature soumise avec succès",
    "data": { "id": 12, "user_id": 7, "job_id": 5, "statut": "en_attente", "cv_path": "/uploads/cv/cv_7.pdf" }
}
```

#### Route 9 - GET /api/applications
Logique adaptée selon le rôle :
- **Candidat** : Voit ses propres dossiers
- **Recruteur** : Voit les candidats pour ses offres
- **Admin** : Accès total

**GET /api/applications**
```json
Header: Authorization: Bearer <token>
Réponse 200 (candidat): { 
    "success": true,
    "data": [ { "id": 12, "job": { "titre": "Dev Backend" }, "statut": "en_attente" } ]
}
Réponse 200 (recruteur): { 
    "success": true,
    "data": [ { "id": 12, "candidat": { "nom": "Jean" }, "cv_path": "..." } ]
}
```

#### Route 10 - PATCH /api/applications/:id/status
Réservé Recruteur/Admin. Logique : Passage du statut de "En attente" à "Entretien" ou "Refusé".

**PATCH /api/applications/12/status**
```json
Header: Authorization: Bearer <token_recruteur>
Body: { "statut": "entretien", "feedback": "Profil intéressant", "interview_date": "2026-04-20T14:00:00Z" }
Réponse 200: { 
    "success": true,
    "message": "Statut de la candidature mis à jour",
    "data": { "id": 12, "statut": "entretien", "updated_at": "2026-04-17T..." }
}
```

### D. ADMINISTRATION ET MODÉRATION (2 endpoints)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 11 | GET | /api/admin/users | Gestion des Utilisateurs - Réservé Admin | Admin |
| 12 | DELETE | /api/admin/users/:id | Modération de Compte - Réservé Admin | Admin |

#### Route 11 - GET /api/admin/users
Réservé Admin. Liste complète de tous les inscrits avec leurs rôles.

**GET /api/admin/users**
```json
Header: Authorization: Bearer <token_admin>
Réponse 200: { 
    "success": true,
    "data": [ { "id": 1, "nom": "Alice", "email": "alice@mail.com", "role": "candidat" }, ... ]
}
```

#### Route 12 - DELETE /api/admin/users/:id
Réservé Admin. Permet de supprimer un utilisateur malveillant ou inactif.

**DELETE /api/admin/users/7**
```json
Header: Authorization: Bearer <token_admin>
Réponse 200: { 
    "success": true,
    "message": "Utilisateur supprimé avec succès"
}
Réponse 404: { 
    "success": false,
    "message": "Utilisateur introuvable"
}
```

---

## V. INTERFACE UTILISATEUR (FRONTEND)

### 1. Pages HTML dynamiques
Le projet inclut une interface utilisateur complète avec les pages suivantes :
- **login.html** : Page de connexion
- **register.html** : Page d'inscription
- **dashboard-candidat.html** : Tableau de bord candidat
- **dashboard-recruteur.html** : Tableau de bord recruteur
- **dashboard-admin.html** : Tableau de bord administrateur
- **applications.html** : Page unifiée de gestion des candidatures
- **jobs-list.html** : Liste des offres d'emploi

### 2. Rôles et interfaces spécifiques
Chaque rôle bénéficie d'une interface adaptée :
- **Candidat** : Accès aux offres, suivi des candidatures, gestion du profil
- **Recruteur** : Gestion des offres, évaluation des candidats, statistiques
- **Administrateur** : Vue globale, gestion des utilisateurs, statistiques complètes

---

## VI. GUIDE DE DÉPLOIEMENT

### 1. Prérequis
- Node.js (v18+) installé
- MySQL installé via Laragon
- HeidiSQL pour la gestion de la base de données
- Navigateur web moderne pour l'interface

### 2. Installation
```bash
git clone https://github.com/recrutdncs/api.git
cd recrutdncs
npm install
```

### 3. Configuration du fichier .env
Créer un fichier .env à la racine du projet :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recrutdncs
JWT_SECRET=votre_secret_jwt_ici
PORT=3000
UPLOAD_PATH=./uploads
```

### 4. Démarrage du serveur
```bash
npm start
```
Le serveur démarre sur http://localhost:3000. Accéder à l'interface via http://localhost:3000/login.html

---

## VII. CONCLUSION

Le projet RECRUTDNCS respecte parfaitement les exigences du cahier des charges :

### Exigences respectées :
- **12 endpoints minimum** : Exactement 12 endpoints implémentés
- **Authentification par Token JWT** : Système complet avec rôles
- **Base de données MySQL** : Modélisation relationnelle complète
- **Stack NodeJS + Express** : Architecture conforme

### Compétences développées :
- **Architecture RESTful** et structuration d'une API Node.js/Express
- **Gestion de l'authentification** et des autorisations avec JWT et Bcrypt
- **Modélisation et manipulation** de bases de données relationnelles MySQL
- **Gestion de fichiers** (upload de CV PDF) avec Multer
- **Développement frontend** avec HTML5, CSS3 et JavaScript Vanilla
- **Conception d'interfaces** adaptatives selon les rôles

Ce système constitue une solution complète et fonctionnelle qui répond à 100% aux exigences du cahier des charges, avec une documentation précise de chaque endpoint et une implémentation robuste et sécurisée.
