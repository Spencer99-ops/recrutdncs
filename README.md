# RECRUTDNCS - Système de Gestion des Recrutements (ATS)

API REST complète pour la gestion du processus de recrutement avec Node.js, Express.js et MySQL.

## Fonctionnalités

- **Gestion des utilisateurs** avec 3 rôles : Candidat, Recruteur, Administrateur
- **Authentification JWT** sécurisée avec hachage des mots de passe
- **Gestion des offres d'emploi** (CRUD complet)
- **Système de candidatures** avec upload de CV (PDF)
- **Tableau de bord administrateur** avec statistiques
- **Validation des données** avec Joi
- **Sécurité renforcée** avec Helmet et CORS

## Architecture Technique

- **Backend** : Node.js / Express.js
- **Base de données** : MySQL
- **Authentification** : JWT (JSON Web Token)
- **Sécurité** : Bcrypt (hachage), Joi (validation)
- **Upload de fichiers** : Multer (PDF uniquement)

## Installation

1. Cloner le projet :
```bash
git clone <repository-url>
cd recrutdncs
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer la base de données :
```bash
# Importer le fichier database.sql dans MySQL via HeidiSQL
# Ou exécuter : mysql -u root -p < database.sql
```

4. Configurer les variables d'environnement :
```bash
# Copier .env et modifier selon votre configuration
cp .env.example .env
```

5. Démarrer le serveur :
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Configuration de la base de données

Le fichier `database.sql` contient :
- La structure complète des tables
- Les index pour optimiser les performances
- Un compte administrateur par défaut (email: admin@recrutdncs.com, mot de passe: admin123)
- Des données de test pour démarrer rapidement

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile/me` - Obtenir son profil
- `PUT /api/auth/profile/me` - Mettre à jour son profil

### Offres d'emploi
- `GET /api/jobs` - Lister toutes les offres (publique)
- `GET /api/jobs/:id` - Détails d'une offre
- `POST /api/jobs` - Créer une offre (Recruteur/Admin)
- `PUT /api/jobs/:id` - Modifier une offre (Recruteur/Admin)
- `DELETE /api/jobs/:id` - Supprimer une offre (Recruteur/Admin)
- `GET /api/jobs/my/jobs` - Mes offres (Recruteur/Admin)

### Candidatures
- `POST /api/applications/apply/:jobId` - Postuler à une offre (Candidat)
- `GET /api/applications` - Lister les candidatures (selon le rôle)
- `GET /api/applications/:id` - Détails d'une candidature
- `PATCH /api/applications/:id/status` - Changer le statut (Recruteur/Admin)

### Administration
- `GET /api/admin/users` - Lister tous les utilisateurs (Admin)
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur (Admin)
- `GET /api/admin/dashboard/stats` - Statistiques du tableau de bord (Admin)

## Rôles et Permissions

### Candidat
- Consulter les offres d'emploi
- Gérer son profil
- Postuler aux offres (avec CV PDF)
- Voir ses candidatures

### Recruteur
- Toutes les permissions du candidat
- Créer/modifier/supprimer ses offres
- Voir les candidatures pour ses offres
- Modifier le statut des candidatures

### Administrateur
- Accès total à toutes les fonctionnalités
- Gérer tous les utilisateurs
- Accéder aux statistiques globales
- Modérer le contenu

## Validation et Sécurité

- **Validation des entrées** avec Joi
- **Hachage des mots de passe** avec Bcrypt
- **Tokens JWT** avec expiration configurable
- **Upload sécurisé** (PDF uniquement, taille limitée)
- **Protection CORS** et **Helmet** pour la sécurité HTTP

## Structure du projet

```
recrutdncs/
|-- src/
|   |-- controllers/     # Logique métier
|   |-- models/         # Modèles de base de données
|   |-- routes/         # Définition des routes
|   |-- middleware/     # Middleware (auth, validation, upload)
|   |-- config/         # Configuration base de données
|   |-- utils/          # Utilitaires
|   |-- app.js          # Configuration Express
|-- uploads/            # Fichiers uploadés (CV)
|-- database.sql        # Structure et données initiales
|-- .env                # Variables d'environnement
|-- index.js            # Point d'entrée
|-- package.json
```

## Exemples d'utilisation

### Inscription d'un candidat
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidat@example.com",
    "password": "password123",
    "nom": "Jean Dupont",
    "telephone": "0612345678",
    "role": "candidat"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidat@example.com",
    "password": "password123"
  }'
```

### Créer une offre (avec token)
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_token>" \
  -d '{
    "titre": "Développeur Full Stack",
    "description": "Description détaillée du poste...",
    "entreprise": "Tech Company",
    "ville": "Paris",
    "type_contrat": "CDI",
    "salaire": "45k-65k"
  }'
```

## Développement

- Le serveur de développement démarre sur `http://localhost:3000`
- Les fichiers uploadés sont stockés dans le dossier `uploads/`
- Utilisez `npm run dev` pour le développement avec redémarrage automatique
- La base de données doit être configurée avant de démarrer le serveur

## Support

Pour toute question ou problème, veuillez consulter la documentation ou créer une issue dans le dépôt du projet.
