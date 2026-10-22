# RECRUTDNCS - Système de Gestion des Recrutements

Application de recrutement en ligne avec API Neon Functions et frontend statique.

## 🚀 Déploiement

### API (Backend)
**URL de production:** https://br-raspy-base-b4dx6n7v-api.compute.c-6.us-east-2.aws.neon.tech/

L'API est hébergée sur Neon Functions avec PostgreSQL.

### Frontend

#### Option 1: Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte GitHub
2. Cliquez sur "Add New Project"
3. Sélectionnez le repository `Spencer99-ops/recrutdncs`
4. Configurez:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Public Directory**: `public`
5. Cliquez sur "Deploy"

Le frontend sera disponible en quelques secondes.

#### Option 2: Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "Add new site" > "Import an existing project"
4. Sélectionnez `Spencer99-ops/recrutdncs`
5. Configurez:
   - **Build command**: (laisser vide)
   - **Publish directory**: `public`
6. Cliquez sur "Deploy site"

## 🔑 Comptes de test

### Administrateur
- Email: admin@recrutdncs.com
- Mot de passe: admin123

### Recruteur
- Email: recruteur@techcompany.com
- Mot de passe: admin123

### Candidats
- jean.dupont@email.com / admin123
- marie.martin@email.com / admin123
- pierre.bernard@email.com / admin123

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify` - Vérifier token

### Offres d'emploi
- `GET /api/jobs` - Liste des offres
- `GET /api/jobs/:id` - Détails d'une offre

### Utilisateurs
- `GET /api/users/:id` - Info utilisateur
- `GET /api/profile/:id` - Profil utilisateur

### Candidatures
- `GET /api/applications` - Liste des candidatures (nécessite auth)

## 🔧 Configuration

L'URL de l'API doit être configurée dans les fichiers JavaScript du frontend:

Dans `public/js/config.js` (à créer):
```javascript
const API_URL = 'https://br-raspy-base-b4dx6n7v-api.compute.c-6.us-east-2.aws.neon.tech/';
```

## 📚 Technologies

- **Backend**: Node.js, Hono, PostgreSQL
- **Hosting**: Neon Functions (API)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: PostgreSQL sur Neon

## 📝 Développement local

### API
```bash
npm install
node server.js
```

### Frontend
Ouvrez simplement `public/index.html` dans votre navigateur.
