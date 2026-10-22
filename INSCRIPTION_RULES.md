# Règles d'Inscription - RECRUTDNCS

## Vue d'ensemble

Le système d'inscription de RECRUTDNCS a été modifié pour permettre uniquement l'auto-inscription des candidats. Les recruteurs et administrateurs doivent être créés manuellement par l'administrateur.

## Règles d'Inscription

### 1. Candidats (Auto-inscription)
- **Accès**: Les candidats peuvent s'inscrire librement via le formulaire d'inscription
- **URL**: `/register.html`
- **Champs requis**:
  - Email professionnel
  - Mot de passe (minimum 6 caractères)
  - Nom complet
  - Téléphone (optionnel)
  - Biographie / Description
  - Localisation
  - Expérience
  - Poste recherché
  - Compétences
  - CV (PDF, max 5MB)

### 2. Recruteurs (Création par admin)
- **Accès**: Les recruteurs ne peuvent pas s'inscrire eux-mêmes
- **Création**: Doivent être créés par l'administrateur via le dashboard admin
- **Champs spécifiques**:
  - Nom de l'entreprise
  - Secteur d'activité
  - Taille de l'entreprise

### 3. Administrateurs (Création par admin)
- **Accès**: Les administrateurs ne peuvent pas s'inscrire eux-mêmes
- **Création**: Doivent être créés par un autre administrateur
- **Droits**: Accès complet à la plateforme

## Flux d'Inscription

### Pour les Candidats

1. **Accès**: Lien "S'inscrire" depuis la page de connexion
2. **Formulaire**: Page d'inscription spécifique aux candidats
3. **Validation**: Vérification des données en temps réel
4. **Création**: Compte créé automatiquement dans la base de données
5. **Redirection**: Vers le dashboard candidat après inscription

### Pour les Recruteurs et Administrateurs

1. **Contact**: Doivent contacter l'administrateur système
2. **Création**: L'administrateur crée le compte via le dashboard
3. **Notification**: Email de bienvenue avec identifiants
4. **Première connexion**: Via la page de connexion standard

## Sécurité

### Contrôle d'Accès
- **Inscription publique**: Uniquement pour les candidats
- **Création restreinte**: Recruteurs et admins créés par admin uniquement
- **Validation**: Tous les comptes sont validés selon leur rôle

### Rôles et Permissions

| Rôle | Inscription | Dashboard | Permissions |
|------|-------------|------------|-------------|
| Candidat | Libre | `profile-candidat.html` | Postuler, gérer profil |
| Recruteur | Admin uniquement | `dashboard-recruteur.html` | Gérer offres, candidatures |
| Administrateur | Admin uniquement | `admin.html` | Gestion complète |

## Processus de Création des Comptes

### Création d'un Recruteur par l'Admin

1. **Connexion**: Admin se connecte sur `/admin.html`
2. **Navigation**: Section "Gestion des utilisateurs"
3. **Création**: Bouton "Ajouter un utilisateur"
4. **Sélection**: Choisir le rôle "Recruteur"
5. **Informations**: Remplir les champs spécifiques à l'entreprise
6. **Validation**: Confirmer la création
7. **Notification**: Email envoyé au nouveau recruteur

### Création d'un Administrateur

1. **Connexion**: Admin existant se connecte
2. **Navigation**: Section "Gestion des utilisateurs"
3. **Création**: Bouton "Ajouter un utilisateur"
4. **Sélection**: Choisir le rôle "Administrateur"
5. **Validation**: Confirmation avec droits élevés
6. **Notification**: Email envoyé au nouvel admin

## Messages d'Erreur

### Erreurs d'Inscription Candidat
- **Email invalide**: "Veuillez entrer une adresse email valide"
- **Mot de passe faible**: "Le mot de passe doit contenir au moins 6 caractères"
- **Email existant**: "Cet email est déjà utilisé"
- **CV invalide**: "Veuillez télécharger un fichier PDF uniquement"

### Accès Refusé
- **Recruteur/Admin**: "Seuls les candidats peuvent s'inscrire. Contactez l'administrateur."

## Email de Bienvenue

### Pour les Candidats
```
Sujet: Bienvenue sur RECRUTDNCS !

Cher candidat,

Votre compte a été créé avec succès.
Vous pouvez maintenant :
- Consulter les offres d'emploi
- Postuler aux offres qui vous intéressent
- Gérer votre profil professionnel

Connectez-vous : [Lien de connexion]

Cordialement,
L'équipe RECRUTDNCS
```

### Pour les Recruteurs
```
Sujet: Votre compte RECRUTDNCS a été créé

Cher recruteur,

Un administrateur a créé votre compte sur RECRUTDNCS.
Vous pouvez maintenant :
- Publier des offres d'emploi
- Gérer les candidatures
- Accéder aux profils des candidats

Identifiants temporaires :
Email : [email]
Mot de passe : [mot de passe]

Nous vous recommandons de changer votre mot de passe lors de votre première connexion.

Cordialement,
L'équipe RECRUTDNCS
```

## Maintenance

### Surveillance des Inscriptions
- **Dashboard admin**: Statistiques sur les nouvelles inscriptions
- **Alertes**: Notification pour les admins lors des nouvelles inscriptions
- **Modération**: Possibilité de suspendre des comptes

### Support
- **Candidats**: Support via le formulaire de contact
- **Recruteurs/Admins**: Support direct par l'équipe admin

## Évolutions Futures

### Possibles Améliorations
1. **Inscription avec invitation**: Système d'invitations pour les recruteurs
2. **Validation d'email**: Confirmation par email avant activation
3. **OAuth**: Connexion via LinkedIn, Google, etc.
4. **Modération**: Approbation manuelle des inscriptions

### Sécurité Renforcée
1. **2FA**: Authentification à deux facteurs
2. **Audit**: Logs des créations de comptes
3. **Limitation**: Taux limite d'inscriptions par IP

---

**Note**: Ces règles garantissent un contrôle qualité sur les profils des recruteurs et administrateurs tout en permettant une inscription libre pour les candidats.
