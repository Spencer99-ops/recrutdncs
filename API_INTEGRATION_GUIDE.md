# Guide d'Intégration API - RECRUTDNCS

## Vue d'ensemble

Ce guide explique comment l'application RECRUTDNCS est maintenant connectée à une base de données MySQL réelle via une API RESTful. Les données mock ont été remplacées par des appels API réels.

## Architecture

### Backend (Node.js + Express)
- **Serveur**: `server.js` - Serveur Express avec middleware
- **Base de données**: `config/database.js` - Connexion MySQL avec pool de connexions
- **Routes API**: 
  - `routes/auth.js` - Authentification (login, register)
  - `routes/jobs.js` - Gestion des offres d'emploi
  - `routes/applications.js` - Gestion des candidatures
  - `routes/profile.js` - Gestion des profils
  - `routes/admin.js` - Administration

### Frontend (JavaScript)
- **Service API**: `public/js/api.js` - Client API centralisé
- **Authentification**: `public/js/auth-api.js` - Gestion login/register
- **Jobs**: `public/js/jobs-api.js` - Interface offres d'emploi
- **Admin**: `public/js/admin-api.js` - Dashboard administrateur

### Base de données (MySQL)
- **Schema**: `database.sql` - Structure complète des tables
- **Données de test**: `test-data.sql` - Données réalistes pour les 3 rôles
- **Initialisation**: `init-database.sql` - Script tout-en-un

## Installation et Configuration

### 1. Configuration de la base de données

```sql
# Créer la base de données
mysql -u root -p < database.sql

# Ajouter les données de test
mysql -u root -p recrutdncs < test-data.sql
```

### 2. Configuration du serveur

Créez le fichier `.env` à la racine du projet :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recrutdncs

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration des uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Clé secrète JWT
JWT_SECRET=your-secret-key-here
```

### 3. Installation des dépendances

```bash
npm install
```

### 4. Démarrage du serveur

```bash
npm start
```

L'application sera accessible à `http://localhost:3000`

## Points d'accès API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Utilisateur actuel
- `POST /api/auth/logout` - Déconnexion

### Offres d'emploi
- `GET /api/jobs` - Lister les offres (avec filtres)
- `GET /api/jobs/:id` - Détails d'une offre
- `POST /api/jobs` - Créer une offre (recruteur)
- `PUT /api/jobs/:id` - Modifier une offre
- `DELETE /api/jobs/:id` - Supprimer une offre

### Candidatures
- `GET /api/applications` - Lister les candidatures
- `POST /api/applications` - Postuler à une offre
- `PUT /api/applications/:id/status` - Mettre à jour le statut

### Profil
- `GET /api/profile` - Obtenir le profil
- `PUT /api/profile` - Mettre à jour le profil
- `GET /api/profile/documents` - Documents de l'utilisateur
- `POST /api/profile/documents` - Uploader un document

### Administration
- `GET /api/admin/statistics` - Statistiques globales
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/:id/role` - Modifier le rôle d'un utilisateur
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur

## Données de test

### Utilisateurs

| Rôle | Email | Mot de passe | Fonction |
|------|-------|--------------|----------|
| Administrateur | admin@recrutdncs.com | admin123 | Gestion globale |
| Recruteur | recruteur.tech@company.com | admin123 | Gestion des offres |
| Recruteur | hr@startup-innovation.com | admin123 | Gestion des offres |
| Recruteur | contact@marketing-pro.com | admin123 | Gestion des offres |
| Candidat | jean.dupont@email.com | admin123 | Postulation aux offres |
| Candidat | marie.martin@email.com | admin123 | Postulation aux offres |
| Candidat | pierre.bernard@email.com | admin123 | Postulation aux offres |
| Candidat | sophie.petit@email.com | admin123 | Postulation aux offres |
| Candidat | thomas.robert@email.com | admin123 | Postulation aux offres |
| Candidat | emma.legrand@email.com | admin123 | Postulation aux offres |

### Offres d'emploi (6 au total)
- **Tech Company**: 3 offres (Frontend, Full Stack, Designer)
- **Startup Innovation**: 2 offres (Data Scientist, Chef de projet)
- **Marketing Pro**: 2 offres (Backend Python, Stage)

### Candidatures (8 au total)
Différents statuts : en_attente, en_revue, entretien, accepte

## Flux de travail

### 1. Connexion
1. L'utilisateur se connecte via `login.html`
2. Le front-end appelle `POST /api/auth/login`
3. Le back-end vérifie les identifiants dans la base de données
4. Un token JWT est retourné et stocké localement

### 2. Dashboard selon le rôle
- **Candidat**: `profile-candidat.html` - Voir profil, postulations, documents
- **Recruteur**: `dashboard-recruteur.html` - Gérer offres, voir candidatures
- **Administrateur**: `admin.html` - Statistiques, gestion utilisateurs

### 3. Opérations CRUD
- **Création**: POST vers les endpoints appropriés
- **Lecture**: GET avec filtres optionnels
- **Mise à jour**: PUT avec les données modifiées
- **Suppression**: DELETE avec l'ID de la ressource

## Sécurité

### Authentification
- Tokens JWT pour sécuriser les sessions
- Middleware d'authentification sur les routes protégées
- Vérification des rôles pour l'accès aux ressources

### Validation
- Joi pour la validation des données d'entrée
- Sanitification des entrées utilisateur
- Protection contre les injections SQL (requêtes paramétrées)

### CORS
- Configuration CORS pour autoriser les requêtes du front-end
- Headers de sécurité configurés avec Helmet

## Gestion des erreurs

### Erreurs client
- Messages d'erreur clairs et informatifs
- Validation côté client avant envoi
- Notifications utilisateur pour les retours d'API

### Erreurs serveur
- Logging des erreurs côté serveur
- Messages d'erreur génériques en production
- Codes HTTP appropriés pour chaque type d'erreur

## Performance

### Base de données
- Pool de connexions MySQL pour optimiser les performances
- Index sur les colonnes fréquemment interrogées
- Requêtes optimisées avec JOINs appropriés

### Frontend
- Appels API asynchrones avec gestion des erreurs
- Mise en cache des données si nécessaire
- Pagination pour les listes importantes

## Développement

### Ajout de nouvelles fonctionnalités

1. **Backend**: Ajouter une nouvelle route dans le fichier approprié
2. **Frontend**: Ajouter la méthode correspondante dans `api.js`
3. **Interface**: Créer le JavaScript spécifique pour la nouvelle fonctionnalité

### Debugging

- Console logs dans le navigateur pour les erreurs frontend
- Logs serveur dans la console Node.js
- Réseau tab dans les outils de développement pour voir les appels API

## Déploiement

### Production
- Configurer les variables d'environnement de production
- Utiliser HTTPS avec un certificat SSL
- Configurer un reverse proxy (nginx/Apache)
- Activer la compression Gzip
- Mettre en place des logs de monitoring

### Base de données
- Configurer une base de données MySQL dédiée
- Mettre en place des sauvegardes régulières
- Optimiser les requêtes pour les volumes de données importants

## Support

En cas de problème :

1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez que la base de données `recrutdncs` existe
3. Vérifiez les identifiants dans le fichier `.env`
4. Consultez les logs du serveur Node.js
5. Utilisez les outils de développement du navigateur pour déboguer

---

**L'application RECRUTDNCS est maintenant entièrement connectée à la base de données et prête à être utilisée avec des données réelles !**
