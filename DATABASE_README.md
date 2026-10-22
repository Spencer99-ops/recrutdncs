# Base de Données RECRUTDNCS

## Vue d'ensemble

La base de données `recrutdncs` est conçue pour gérer une plateforme de recrutement complète avec 3 types d'utilisateurs : candidats, recruteurs et administrateurs.

## Structure des Tables

### 1. `users` - Utilisateurs
Table principale contenant tous les utilisateurs de la plateforme.

**Colonnes :**
- `id` : Identifiant unique auto-incrémenté
- `email` : Email unique (obbligatoire)
- `password` : Mot de passe hashé (obbligatoire)
- `nom` : Nom de famille (Obbligatoire)
- `prenom` : Prénom
- `telephone` : Numéro de téléphone
- `role` : Rôle ('candidat', 'recruteur', 'administrateur')
- `bio` : Biographie/description
- **Champs candidats :**
  - `location` : Localisation géographique
  - `experience` : Niveau d'expérience ('0-1', '1-3', '3-5', '5-10', '10+')
  - `job_title` : Poste recherché
  - `skills` : Compétences techniques
  - `avatar_path` : Chemin vers l'avatar
  - `cv_path` : Chemin vers le CV
  - `cover_letter_path` : Chemin vers la lettre de motivation
- **Champs recruteurs :**
  - `company_name` : Nom de l'entreprise
  - `company_sector` : Secteur d'activité
  - `company_size` : Taille de l'entreprise
- `created_at` : Date de création
- `updated_at` : Date de dernière mise à jour

### 2. `jobs` - Offres d'emploi
Table contenant toutes les offres d'emploi publiées par les recruteurs.

**Colonnes :**
- `id` : Identifiant unique
- `titre` : Titre du poste (Obbligatoire)
- `description` : Description détaillée (Obbligatoire)
- `requirements` : Compétences requises
- `benefits` : Avantages offerts
- `entreprise` : Nom de l'entreprise (Obbligatoire)
- `location` : Localisation du poste (Obbligatoire)
- `type_contrat` : Type de contrat ('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel')
- `salaire_min` : Salaire minimum
- `salaire_max` : Salaire maximum
- `remote` : Télétravail possible (TRUE/FALSE)
- `user_id` : ID du recruteur (clé étrangère)
- `status` : Statut ('active', 'inactive', 'draft', 'closed')
- `created_at` : Date de création
- `updated_at` : Date de dernière mise à jour

### 3. `applications` - Candidatures
Table reliant les candidats aux offres d'emploi.

**Colonnes :**
- `id` : Identifiant unique
- `job_id` : ID de l'offre (clé étrangère)
- `user_id` : ID du candidat (clé étrangère)
- `cv_path` : Chemin vers le CV utilisé
- `cover_letter_path` : Chemin vers la lettre de motivation
- `message_motivation` : Message personnalisé du candidat
- `statut` : Statut de la candidature ('en_attente', 'en_revue', 'entretien', 'accepte', 'refuse')
- `interview_date` : Date de l'entretien
- `feedback` : Feedback du recruteur
- `created_at` : Date de création
- `updated_at` : Date de dernière mise à jour

### 4. `documents` - Gestion centralisée des documents
Table pour gérer tous les documents uploadés par les utilisateurs.

**Colonnes :**
- `id` : Identifiant unique
- `user_id` : ID de l'utilisateur (clé étrangère)
- `type` : Type de document ('cv', 'cover_letter', 'avatar')
- `file_name` : Nom original du fichier
- `file_path` : Chemin de stockage
- `file_size` : Taille en octets
- `mime_type` : Type MIME du fichier
- `created_at` : Date de création
- `updated_at` : Date de dernière mise à jour

### 5. `notifications` - Notifications système
Table pour gérer les notifications envoyées aux utilisateurs.

**Colonnes :**
- `id` : Identifiant unique
- `user_id` : ID du destinataire (clé étrangère)
- `type` : Type de notification ('application_status', 'new_job_match', 'interview_scheduled', 'system')
- `title` : Titre de la notification
- `message` : Message détaillé
- `read` : Statut de lecture (TRUE/FALSE)
- `created_at` : Date de création

### 6. `statistics` - Statistiques du dashboard
Table pour stocker les statistiques utilisées par le dashboard administrateur.

**Colonnes :**
- `id` : Identifiant unique
- `metric_name` : Nom de la métrique
- `metric_value` : Valeur numérique
- `metric_date` : Date de la métrique
- `created_at` : Date de création

## Relations entre les Tables

```
users (1) -----> (N) jobs (recruteur)
users (1) -----> (N) applications (candidat)
jobs (1) -----> (N) applications
users (1) -----> (N) documents
users (1) -----> (N) notifications
```

## Index de Performance

Des index sont créés pour optimiser les requêtes fréquentes :
- Recherche par email et rôle dans `users`
- Recherche par statut et localisation dans `jobs`
- Recherche par utilisateur et statut dans `applications`
- Recherche par utilisateur et type dans `documents`
- Recherche par utilisateur et statut de lecture dans `notifications`

## Données de Test

La base de données inclut des données de test pour démonstration :

### Utilisateurs
- **Administrateur** : admin@recrutdncs.com / admin123
- **Recruteur** : recruteur@techcompany.com
- **Candidats** : jean.dupont@email.com, marie.martin@email.com, pierre.bernard@email.com

### Offres d'emploi
- Développeur Frontend Senior (Paris, CDI, 45k-65k€)
- Développeur Full Stack (Lyon, CDI, 40k-55k€)
- Designer UI/UX Junior (Marseille, CDD, 35k-42k€)

### Candidatures
- Jean Dupont → Développeur Frontend Senior (en_attente)
- Marie Martin → Développeur Full Stack (en_revue)
- Pierre Bernard → Designer UI/UX Junior (entretien)

## Installation et Utilisation

### 1. Initialisation
```bash
# Importer la base de données
mysql -u root -p < init-database.sql

# Ou importer depuis MySQL
mysql -u root -p
SOURCE /path/to/init-database.sql;
```

### 2. Connexion depuis l'application
L'application doit se connecter avec les paramètres suivants :
- **Hôte** : localhost
- **Base de données** : recrutdncs
- **Utilisateur** : root (ou utilisateur configuré)
- **Mot de passe** : [votre mot de passe MySQL]

### 3. Utilisation dans les Dashboards

#### Dashboard Candidat
- Utilise la table `users` avec les champs spécifiques aux candidats
- Affiche les candidatures depuis `applications`
- Gère les documents depuis `documents`
- Reçoit les notifications depuis `notifications`

#### Dashboard Recruteur
- Utilise la table `users` avec les champs spécifiques aux recruteurs
- Gère les offres depuis `jobs`
- Consulte les candidatures depuis `applications`
- Crée de nouvelles offres dans `jobs`

#### Dashboard Administrateur
- Accès à toutes les tables
- Statistiques depuis `statistics`
- Gestion des utilisateurs dans `users`
- Supervision des offres et candidatures

## Sécurité

### 1. Mots de passe
- Les mots de passe sont hashés avec bcrypt
- Le mot de passe administrateur par défaut est `admin123` (à changer en production)

### 2. Contraintes
- Email unique dans `users`
- Clés étrangères avec suppression en cascade
- Candidature unique par utilisateur et offre

### 3. Permissions
- Les recruteurs ne peuvent voir que leurs propres offres
- Les candidats ne peuvent voir que leurs propres candidatures
- L'administrateur a accès à toutes les données

## Maintenance

### 1. Sauvegardes
```bash
# Sauvegarder la base de données
mysqldump -u root -p recrutdncs > backup_$(date +%Y%m%d).sql
```

### 2. Nettoyage
- Nettoyer régulièrement les anciennes notifications
- Archiver les anciennes offres fermées
- Mettre à jour les statistiques quotidiennement

## Évolutions Possibles

### 1. Fonctionnalités futures
- Tags de compétences pour les offres
- Système de recommandation automatique
- Messagerie interne entre candidats et recruteurs
- Évaluations et notations
- Intégration avec les réseaux sociaux

### 2. Optimisations
- Partitionnement des tables pour grand volume
- Cache Redis pour les requêtes fréquentes
- Recherche全文 avec Elasticsearch
- Monitoring des performances

## Support

Pour toute question sur la base de données ou son utilisation, consultez :
1. La documentation technique de l'application
2. Les logs d'erreurs de l'application
3. L'administrateur système : admin@recrutdncs.com
