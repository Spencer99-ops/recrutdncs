# RECRUTDNCS API - Système de Gestion des Recrutements (ATS)

## Présentation

RECRUTDNCS est une API REST conçue pour automatiser et sécuriser le flux de recrutement au sein d'une organisation. Elle permet de gérer le cycle de vie complet d'une embauche : de la publication de l'offre par un recruteur à la gestion des utilisateurs par un administrateur, en passant par le dépôt de candidature (avec CV) par un candidat.

## Architecture Technique

- **Environnement**: Laragon (Serveur local)
- **Langage & Framework**: Node.js / Express.js
- **Base de données**: MySQL (Gestion via HeidiSQL)
- **Authentification**: JWT (JSON Web Token)
- **Sécurité**: Hachage des mots de passe avec Bcrypt et validation des données avec Joi
- **Stockage**: Gestion des fichiers PDF (CV) via le middleware Multer

## Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer la base de données**
   - Importer le fichier `database.sql` dans HeidiSQL
   - Vérifier la configuration dans le fichier `.env`

3. **Démarrer le serveur**
   ```bash
   node start-server.js
   ```
   ou
   ```bash
   npm start
   ```

4. **Tester l'API**
   ```bash
   node test-api.js
   ```

## Système de Rôles

L'application repose sur trois niveaux d'autorisation strictement définis :

### Candidat
- Peut consulter les offres
- Gérer son profil
- Postuler aux offres avec CV

### Recruteur
- Peut créer des offres
- Gérer ses propres publications
- Évaluer les candidats

### Administrateur
- Super-utilisateur ayant un droit de regard et de modification sur l'intégralité de la base de données

## Endpoints API

### Authentification et Profils

#### POST /api/auth/register - Inscription
**Description**: Création de compte avec rôle par défaut
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Jean Dupont",
  "telephone": "0612345678",
  "bio": "Développeur web",
  "role": "candidat"
}
```

#### POST /api/auth/login - Connexion
**Description**: Génération d'un Token JWT
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/profile/me - Obtenir mon profil
**Headers**: `Authorization: Bearer <token>`

#### PUT /api/profile/me - Mettre à jour mon profil
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "nom": "Nouveau nom",
  "telephone": "0612345678",
  "bio": "Nouvelle biographie"
}
```

### Gestion des Offres (Jobs)

#### GET /api/jobs - Lister les offres (public)
**Query Parameters**:
- `ville`: Filtrer par ville
- `type_contrat`: Filtrer par type de contrat
- `titre`: Rechercher dans le titre

#### POST /api/jobs - Créer une offre
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: recruteur, administrateur
**Body**:
```json
{
  "titre": "Développeur Full Stack",
  "description": "Description détaillée...",
  "entreprise": "Tech Company",
  "ville": "Paris",
  "type_contrat": "CDI",
  "salaire": "45k-60k"
}
```

#### GET /api/jobs/:id - Obtenir une offre spécifique

#### PUT /api/jobs/:id - Modifier une offre
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: recruteur (propriétaire), administrateur

#### DELETE /api/jobs/:id - Supprimer une offre
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: recruteur (propriétaire), administrateur

### Gestion des Candidatures (Applications)

#### POST /api/apply/:jobId - Postuler à une offre
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: candidat
**Content-Type**: `multipart/form-data`
**Body**:
- `cv`: Fichier PDF (obligatoire)
- `lettre_motivation`: Texte (optionnel)

#### GET /api/applications - Lister les candidatures
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**:
- Candidat: Voit ses propres dossiers
- Recruteur: Voit les candidats pour ses offres
- Administrateur: Accès total

#### PATCH /api/applications/:id/status - Changer le statut
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: recruteur, administrateur
**Body**:
```json
{
  "statut": "entretien"
}
```
**Statuts possibles**: `en_attente`, `entretien`, `refuse`

#### GET /api/applications/:id/cv - Télécharger le CV
**Headers**: `Authorization: Bearer <token>`

### Administration et Modération

#### GET /api/admin/users - Lister tous les utilisateurs
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: administrateur

#### DELETE /api/admin/users/:id - Supprimer un utilisateur
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: administrateur

#### GET /api/admin/stats - Statistiques du système
**Headers**: `Authorization: Bearer <token>`
**Rôles requis**: administrateur

## Sécurité

### JWT Token
- Durée de vie: 7 jours (configurable)
- Contient: userId, email, role
- En-tête: `Authorization: Bearer <token>`

### Validation des données
- Utilisation de Joi pour la validation des entrées
- Messages d'erreur détaillés
- Protection contre les injections

### Hachage des mots de passe
- Utilisation de Bcrypt avec 10 rounds
- Mot de passe minimum 6 caractères

### Upload de fichiers
- Accepte uniquement les fichiers PDF
- Taille maximale: 5MB
- Stockage dans le dossier `uploads/cv/`

## Exemples d'utilisation

### Inscription d'un candidat
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidat@example.com",
    "password": "password123",
    "nom": "Jean Candidat",
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

### Créer une offre
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "titre": "Développeur React",
    "description": "Nous recherchons un développeur React...",
    "entreprise": "Tech Corp",
    "ville": "Lyon",
    "type_contrat": "CDI"
  }'
```

## Structure du projet

```
recrutdncs/
|-- config/
|   |-- database.js          # Configuration MySQL
|-- middleware/
|   |-- auth.js              # Middleware d'authentification
|-- routes/
|   |-- auth.js              # Routes d'authentification
|   |-- profile.js           # Routes des profils
|   |-- jobs.js              # Routes des offres
|   |-- applications.js      # Routes des candidatures
|   |-- admin.js             # Routes d'administration
|-- uploads/
|   |-- cv/                  # Fichiers CV uploadés
|-- public/                  # Frontend statique
|-- .env                     # Variables d'environnement
|-- package.json
|-- server.js                # Serveur principal
|-- start-server.js          # Script de démarrage
|-- test-api.js              # Script de test
```

## Tests

Le script `test-api.js` effectue les tests suivants automatiquement:

1. Connexion à l'API
2. Inscription d'un candidat
3. Connexion du candidat
4. Obtention du profil
5. Listing des offres
6. Inscription d'un recruteur
7. Création d'une offre
8. Inscription d'un administrateur
9. Obtention des statistiques admin

Pour exécuter les tests:
```bash
node test-api.js
```

## Développement

### Mode développement
```bash
npm run dev
```
Utilise `nodemon` pour le redémarrage automatique.

### Logs
Les logs sont affichés dans la console pour le développement.

### Base de données
La structure de la base de données est définie dans `database.sql`.

## Production

Pour le déploiement en production:

1. Changer le `JWT_SECRET` dans `.env`
2. Configurer `NODE_ENV=production`
3. Utiliser HTTPS
4. Configurer un reverse proxy (nginx)
5. Mettre en place des logs persistants
6. Configurer une base de données MySQL distante

## Support

Pour toute question ou problème:
- Vérifier les logs du serveur
- Consulter la documentation des endpoints
- Tester avec le script `test-api.js`
- Vérifier la configuration de la base de données
