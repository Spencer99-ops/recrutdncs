# RECRUTDNCS - Guide de déploiement (Neon + Vercel)

## Architecture
- **Backend**: Node.js + Express
- **Base de données**: PostgreSQL (Neon)
- **Hébergement**: Vercel (ou Render pour backend API)

## Étapes de déploiement

### 1. Créer un compte Neon
1. Allez sur https://neon.com
2. Créez un compte gratuit
3. Créez un nouveau projet PostgreSQL

### 2. Obtenir les identifiants Neon
Une fois connecté:
- Obtenez votre `DATABASE_URL` depuis le dashboard Neon
- Format: `postgresql://user:password@host:5432/database`

### 3. Créer un dépôt GitHub
```bash
# Si ce n'est pas déjà fait
gh repo create recrutdncs --public --source=. --remote=origin
git push -u origin main
```

Ou manuellement:
1. Allez sur https://github.com/new
2. Créez un nouveau dépôt
3. Suivez les instructions pour pousser le code

### 4. Option A: Déploiement complet sur Vercel (recommandé pour démo)

#### 4.1. Importer sur Vercel
1. Allez sur https://vercel.com/new
2. Importez votre dépôt GitHub
3. Vercel détectera automatiquement Node.js

#### 4.2. Configurer les variables d'environnement
Dans Vercel dashboard → Settings → Environment Variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=votre_secret_ici
NODE_ENV=production
PORT=3000
```

#### 4.3. Initialiser la base de données
Connectez-vous à votre base Neon via le SQL Editor et exécutez:
```bash
# Copiez le contenu de database_postgres.sql
# Exécutez-le dans l'éditeur SQL Neon
```

#### 4.4. Déployer
Cliquez sur "Deploy" dans Vercel

### 5. Option B: Backend sur Render + Frontend sur Vercel

Cette option est plus stable pour les applications avec uploads de fichiers.

#### 5.1. Déployer le backend sur Render
1. Allez sur https://render.com
2. Créez un "Web Service"
3. Connectez votre dépôt GitHub
4. Configurez:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: mêmes que ci-dessus

#### 5.2. Configurer le stockage des fichiers
Pour les uploads de CV:
- Option 1: Désactiver temporairement les uploads
- Option 2: Utiliser Neon Object Storage
- Option 3: Utiliser Cloudinary ou AWS S3

#### 5.3. Déployer le frontend sur Vercel
Le dossier `public/` peut être servi statiquement sur Vercel.

## Variables d'environnement requises

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Identifiants par défaut

- **Email admin**: admin@recrutdncs.com
- **Mot de passe**: admin123

⚠️ **IMPORTANT**: Changez ce mot de passe après le premier déploiement !

## Problèmes connus

### Uploads de fichiers
Le stockage local (`./uploads`) ne fonctionne pas en production sur Vercel/Render (système de fichiers éphémère).

**Solutions**:
1. Utiliser Neon Object Storage
2. Utiliser Cloudinary pour les images/CV
3. Stocker les CV en base64 dans la base de données (non recommandé pour gros fichiers)

### Connection pool PostgreSQL
Assurez-vous que votre connexion Neon supporte assez de connexions simultanées. Le plan gratuit de Neon est limité.

## Support

- Neon: https://neon.com/docs
- Vercel: https://vercel.com/docs
- Express: https://expressjs.com
