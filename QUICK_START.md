# Démarrage Rapide RECRUTDNCS API

## Étape 1: Installation des dépendances
```bash
npm install
```

## Étape 2: Vérification de la base de données
Assurez-vous que:
- MySQL est démarré dans Laragon
- La base de données `recrutdncs` existe
- Le fichier `database.sql` a été importé

## Étape 3: Démarrage du serveur
```bash
node start-server.js
```

## Étape 4: Test de l'API
Dans un autre terminal:
```bash
node test-api.js
```

## Étape 5: Accès à l'API
- **API Base URL**: http://localhost:3000/api
- **Documentation**: API_README.md
- **Frontend**: http://localhost:3000 (page d'accueil)

## Comptes de test créés automatiquement:
- **Candidat**: test.candidat@example.com / password123
- **Recruteur**: test.recruteur@example.com / password123  
- **Admin**: test.admin@example.com / admin123

## Tests rapides avec curl:

### Tester l'API
```bash
curl http://localhost:3000/api
```

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nom":"Test User","role":"candidat"}'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Lister les offres
```bash
curl http://localhost:3000/api/jobs
```

## En cas de problème:
1. Vérifiez que Laragon est bien démarré
2. Vérifiez la configuration dans `.env`
3. Consultez les logs du serveur
4. Exécutez `node test-api.js` pour diagnostiquer
