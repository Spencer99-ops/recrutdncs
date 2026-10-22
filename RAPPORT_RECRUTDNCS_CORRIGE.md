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

I. INTRODUCTION
1. Contexte du Projet
2. Objectifs
3. Technologies Utilisées

II. ANALYSE FONCTIONNELLE
1. Diagramme de Cas d'Utilisation (Use Case)
   A. Acteurs du système
2. Règles de Gestion

III. MODÉLISATION DE LA BASE DE DONNÉES
1. Schéma Relationnel
   - Table : users
   - Table : jobs (Offres d'emploi)
   - Table : applications (Candidatures)
   - Table : documents

IV. DOCUMENTATION DE L'API
A. Authentification & Profils
   - Route 1 - POST /api/auth/register
   - Route 2 - POST /api/auth/login
   - Route 3 - PUT /api/profile/me
   - Route 4 - GET /api/profile/me

B. Gestion des Offres d'Emploi (Jobs)
   - Route 5 - GET /api/jobs
   - Route 6 - POST /api/jobs
   - Route 7 - PUT /api/jobs/:id
   - Route 8 - DELETE /api/jobs/:id
   - Route 9 - GET /api/jobs/:id

C. Gestion des Candidatures (Applications)
   - Route 10 - POST /api/apply/:jobId
   - Route 11 - GET /api/applications
   - Route 12 - PUT /api/applications/:id
   - Route 13 - DELETE /api/applications/:id
   - Route 14 - PATCH /api/applications/:id/status

D. Administration & Modération
   - Route 15 - GET /api/admin/users
   - Route 16 - DELETE /api/admin/users/:id
   - Route 17 - GET /api/admin/applications
   - Route 18 - GET /api/admin/stats

E. Statistiques et Tableaux de bord
   - Route 19 - GET /api/stats/profile
   - Route 20 - GET /api/stats/jobs
   - Route 21 - GET /api/stats/admin

V. INTERFACE UTILISATEUR (FRONTEND)
1. Pages HTML dynamiques
2. Rôles et interfaces spécifiques
3. Fonctionnalités JavaScript

VI. GUIDE DE DÉPLOIEMENT
1. Prérequis
2. Installation
3. Configuration du fichier .env
4. Démarrage du serveur

VII. CONCLUSION

---

## I. INTRODUCTION

### 1. Contexte du Projet
RECRUTDNCS est une plateforme complète de gestion des recrutements (ATS - Applicant Tracking System) qui automatise et sécurise l'ensemble du processus de recrutement. Contrairement à une simple API, ce système inclut une interface utilisateur complète qui permet de gérer le cycle de vie complet d'une embauche : de la publication de l'offre par un recruteur à la gestion des utilisateurs par un administrateur, en passant par le dépôt de candidature avec CV par un candidat.

### 2. Objectifs
- Automatiser et sécuriser le processus de recrutement
- Gérer les offres d'emploi, les candidatures et les utilisateurs
- Implémenter une authentification robuste avec JWT
- Fournir une interface utilisateur complète et intuitive
- Proposer des tableaux de bord statistiques par rôle
- Gérer les documents (CV, lettres de motivation) de manière sécurisée

### 3. Technologies Utilisées
Le projet repose sur la stack technique suivante :
- **Environnement de développement** : Laragon (Serveur local)
- **Langage & Framework** : Node.js / Express.js
- **Base de données** : MySQL (Gestion via HeidiSQL)
- **Authentification** : JWT (JSON Web Token)
- **Sécurité** : Hachage des mots de passe avec Bcrypt, validation avec Joi
- **Stockage fichiers** : Gestion des CV PDF via le middleware Multer
- **Frontend** : HTML5, CSS3, JavaScript Vanilla
- **Dépendances supplémentaires** : Axios, Helmet, MySQL2, node-fetch

---

## II. ANALYSE FONCTIONNELLE

### 1. Diagramme de Cas d'Utilisation (Use Case)
Le système RECRUTDNCS interagit avec trois types d'acteurs principaux, chacun disposant de permissions strictement définies.

#### A. Acteurs du système
- **Candidat** : Peut consulter les offres, gérer son profil, soumettre une candidature avec CV, suivre ses candidatures
- **Recruteur** : Peut créer, modifier et supprimer des offres d'emploi, évaluer les candidats, planifier des entretiens
- **Administrateur** : Super-utilisateur ayant un droit de regard et de modification sur l'intégralité de la base de données

### 2. Règles de Gestion
- Un candidat ne peut pas postuler deux fois à la même offre
- Seul le créateur d'une offre (ou l'Admin) peut la modifier ou la supprimer
- Le statut d'une candidature évolue de "en_attente" vers "entretien", "accepte" ou "refuse"
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
| cover_letter_path | VARCHAR(255) | NULL | Chemin de la lettre de motivation |
| company_name | VARCHAR(100) | NULL | Nom de l'entreprise (recruteur) |
| company_sector | VARCHAR(100) | NULL | Secteur d'activité |
| company_size | VARCHAR(50) | NULL | Taille de l'entreprise |
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

#### Table : documents
| Champ | Type | Contraintes | Description |
|-------|------|------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identifiant unique |
| user_id | INT | NOT NULL, FK | Utilisateur propriétaire |
| type | ENUM | NOT NULL | cv / cover_letter / avatar |
| file_name | VARCHAR(255) | NOT NULL | Nom du fichier |
| file_path | VARCHAR(500) | NOT NULL | Chemin du fichier |
| file_size | INT | NULL | Taille du fichier |
| mime_type | VARCHAR(100) | NULL | Type MIME |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date d'upload |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de modification |

---

## IV. DOCUMENTATION DE L'API

L'API RECRUTDNCS expose 21 endpoints RESTful organisés en 5 catégories fonctionnelles. Chaque requête nécessitant une authentification doit obligatoirement inclure le header HTTP suivant :

```
Authorization: Bearer <token_jwt>
```

Le token JWT est obtenu après connexion via POST /api/auth/login. En cas d'absence ou d'invalidité du token, l'API retourne une erreur 401 Unauthorized.

### A. Authentification & Profils

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 1 | POST | /api/auth/register | Inscription avec validation complète | Public |
| 2 | POST | /api/auth/login | Connexion et génération Token JWT | Public |
| 3 | PUT | /api/profile/me | Mise à jour du profil connecté | Connecté |
| 4 | GET | /api/profile/me | Récupérer le profil connecté | Connecté |

#### Route 1 - POST /api/auth/register
Cette route permet à tout visiteur de créer un compte sur la plateforme. Le corps de la requête doit contenir les champs email, password, nom et optionnellement role. Le middleware de validation Joi vérifie que l'email est bien formaté, que le mot de passe respecte la politique de sécurité (minimum 6 caractères), et que le champ nom n'est pas vide.

**POST /api/auth/register**
```json
Body: { 
    "nom": "Jean Dupont", 
    "email": "jean@mail.com", 
    "password": "motdepasse123", 
    "role": "candidat" 
}
Réponse 201: { 
    "success": true,
    "message": "Utilisateur créé avec succès",
    "user": { "id": 1, "nom": "Jean Dupont", "email": "jean@mail.com", "role": "candidat" }
}
```

#### Route 2 - POST /api/auth/login
Cette route permet à un utilisateur enregistré de se connecter. Le serveur reçoit l'email et le mot de passe en clair, récupère l'entrée correspondante en base de données, puis compare le mot de passe fourni avec le hash stocké via la fonction bcrypt.compare().

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

### B. Gestion des Offres d'Emploi (Jobs)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 5 | GET | /api/jobs | Lister les offres (publique) | Public |
| 6 | POST | /api/jobs | Créer une offre | Recruteur / Admin |
| 7 | PUT | /api/jobs/:id | Modifier une offre | Recruteur / Admin |
| 8 | DELETE | /api/jobs/:id | Supprimer une offre | Recruteur / Admin |
| 9 | GET | /api/jobs/:id | Détails d'une offre | Public |

#### Route 5 - GET /api/jobs
Cette route retourne la liste de toutes les offres d'emploi disponibles. Elle est accessible sans authentification et supporte une recherche multicritères via des paramètres de requête.

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

### C. Gestion des Candidatures (Applications)

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 10 | POST | /api/apply/:jobId | Postuler à une offre | Candidat |
| 11 | GET | /api/applications | Lister les candidatures selon le rôle | Tous |
| 12 | PUT | /api/applications/:id | Modifier une candidature | Admin |
| 13 | DELETE | /api/applications/:id | Supprimer une candidature | Candidat / Admin |
| 14 | PATCH | /api/applications/:id/status | Changer le statut | Recruteur / Admin |

#### Route 10 - POST /api/apply/:jobId
Cette route permet à un candidat authentifié de postuler à une offre d'emploi. Elle utilise le middleware Multer pour gérer l'upload du fichier CV au format PDF.

**POST /api/apply/5**
```json
Header: Authorization: Bearer <token_candidat>
Body (multipart/form-data): { cv: <fichier_cv.pdf> }
Réponse 201: { 
    "success": true,
    "message": "Candidature soumise avec succès",
    "data": { "id": 12, "user_id": 7, "job_id": 5, "statut": "en_attente" }
}
```

#### Route 11 - GET /api/applications
Cette route adapte son comportement selon le rôle de l'utilisateur authentifié.

**GET /api/applications**
```json
Réponse 200 (candidat): { 
    "success": true,
    "data": [ { "id": 12, "job": { "titre": "Dev Backend" }, "statut": "en_attente" } ]
}
Réponse 200 (recruteur): { 
    "success": true,
    "data": [ { "id": 12, "candidat": { "nom": "Jean" }, "cv_path": "..." } ]
}
```

### D. Administration & Modération

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 15 | GET | /api/admin/users | Liste complète des utilisateurs | Admin |
| 16 | DELETE | /api/admin/users/:id | Supprimer un utilisateur | Admin |
| 17 | GET | /api/admin/applications | Toutes les candidatures | Admin |
| 18 | GET | /api/admin/stats | Statistiques globales | Admin |

#### Route 15 - GET /api/admin/users
Cette route retourne la liste complète de tous les utilisateurs enregistrés sur la plateforme.

**GET /api/admin/users**
```json
Réponse 200: { 
    "success": true,
    "data": [ { "id": 1, "nom": "Alice", "email": "alice@mail.com", "role": "candidat" }, ... ]
}
```

### E. Statistiques et Tableaux de bord

| # | Méthode | Route | Description | Rôle |
|---|---------|-------|-------------|------|
| 19 | GET | /api/stats/profile | Statistiques du profil utilisateur | Connecté |
| 20 | GET | /api/stats/jobs | Statistiques des offres | Recruteur / Admin |
| 21 | GET | /api/stats/admin | Statistiques globales | Admin |

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
- **profile.html** : Gestion du profil utilisateur

### 2. Rôles et interfaces spécifiques
Chaque rôle bénéficie d'une interface adaptée :
- **Candidat** : Accès aux offres, suivi des candidatures, gestion du profil
- **Recruteur** : Gestion des offres, évaluation des candidats, statistiques
- **Administrateur** : Vue globale, gestion des utilisateurs, statistiques complètes

### 3. Fonctionnalités JavaScript
- Validation des formulaires en temps réel
- Gestion des uploads de fichiers
- Navigation dynamique selon le rôle
- Tableaux de bord interactifs avec graphiques
- Système de messagerie intégré

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

Le projet RECRUTDNCS nous a permis de mettre en pratique les concepts fondamentaux du développement web moderne. À travers la conception et l'implémentation de cette plateforme complète, nous avons approfondi nos compétences en :

- **Architecture RESTful et structuration d'une API Node.js/Express**
- **Développement frontend avec HTML5, CSS3 et JavaScript Vanilla**
- **Gestion de l'authentification et des autorisations avec JWT et Bcrypt**
- **Modélisation et manipulation de bases de données relationnelles MySQL**
- **Gestion de fichiers (upload de CV PDF) avec Multer**
- **Conception d'interfaces utilisateur adaptatives selon les rôles**
- **Implémentation de tableaux de bord statistiques**

Ce système constitue une solution complète et fonctionnelle pouvant évoluer vers des fonctionnalités avancées comme les notifications par email, les entretiens vidéo, l'intégration avec des systèmes externes, ou encore une application mobile.

Ce projet nous a également appris à travailler en équipe, à découper les responsabilités, et à maintenir une documentation claire tout au long du développement.
