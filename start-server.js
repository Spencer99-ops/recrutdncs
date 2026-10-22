#!/usr/bin/env node

console.log('=== Démarrage de RECRUTDNCS API Server ===\n');

// Vérifier les dépendances
try {
    require('express');
    require('mysql2');
    require('jsonwebtoken');
    require('bcryptjs');
    require('joi');
    require('multer');
    console.log('Toutes les dépendances sont installées');
} catch (error) {
    console.error('Erreur de dépendance:', error.message);
    console.log('Veuillez exécuter: npm install');
    process.exit(1);
}

// Démarrer le serveur
const app = require('./server.js');

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
    console.log('\nArrêt du serveur...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nArrêt du serveur...');
    process.exit(0);
});

// Afficher les informations de démarrage
console.log('\n=== RECRUTDNCS API Server est prêt ===');
console.log('Documentation des endpoints:');
console.log('Authentification:');
console.log('  POST /api/auth/register - Inscription');
console.log('  POST /api/auth/login - Connexion');
console.log('  POST /api/auth/verify - Vérifier un token');
console.log('');
console.log('Profils:');
console.log('  GET /api/profile/me - Obtenir mon profil');
console.log('  PUT /api/profile/me - Mettre à jour mon profil');
console.log('  GET /api/profile/:id - Obtenir un profil public');
console.log('');
console.log('Offres d\'emploi:');
console.log('  GET /api/jobs - Lister les offres (public)');
console.log('  GET /api/jobs/:id - Obtenir une offre');
console.log('  POST /api/jobs - Créer une offre (recruteur/admin)');
console.log('  PUT /api/jobs/:id - Modifier une offre');
console.log('  DELETE /api/jobs/:id - Supprimer une offre');
console.log('');
console.log('Candidatures:');
console.log('  POST /api/apply/:jobId - Postuler (candidat)');
console.log('  GET /api/applications - Lister les candidatures');
console.log('  GET /api/applications/:id - Obtenir une candidature');
console.log('  PATCH /api/applications/:id/status - Changer le statut (recruteur/admin)');
console.log('  GET /api/applications/:id/cv - Télécharger le CV');
console.log('');
console.log('Administration:');
console.log('  GET /api/admin/users - Lister tous les utilisateurs (admin)');
console.log('  GET /api/admin/users/:id - Obtenir un utilisateur (admin)');
console.log('  DELETE /api/admin/users/:id - Supprimer un utilisateur (admin)');
console.log('  GET /api/admin/stats - Statistiques du système (admin)');
console.log('  GET /api/admin/jobs - Lister toutes les offres (admin)');
console.log('  DELETE /api/admin/jobs/:id - Supprimer une offre (admin)');
console.log('  GET /api/admin/applications - Lister toutes les candidatures (admin)');
console.log('  DELETE /api/admin/applications/:id - Supprimer une candidature (admin)');
console.log('');
console.log('Tests disponibles:');
console.log('  curl http://localhost:3000/api');
console.log('  node test-api.js');
console.log('========================================\n');
