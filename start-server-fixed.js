#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('=== DÉMARRAGE DU SERVEUR RECRUTDNCS ===\n');

// Configuration pour éviter les interactions avec la console
const options = {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    cwd: __dirname,
    env: {
        ...process.env,
        // Désactiver les interactions MySQL
        MYSQL_PWD: process.env.DB_PASSWORD || '',
        // Forcer le mode non interactif
        NODE_ENV: 'production'
    }
};

try {
    console.log('Démarrage du serveur Node.js...');
    console.log('URL: http://localhost:3000');
    console.log('API: http://localhost:3000/api');
    console.log('===============================\n');
    
    // Démarrer le serveur avec les options corrigées
    const serverProcess = spawn('node', ['server.js'], options);
    
    // Gérer les sorties pour éviter les blocages
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Filtrer les messages problématiques
        if (output.includes('Terminer le programme de commandes')) {
            // Envoyer automatiquement "N" pour éviter la boucle
            serverProcess.stdin.write('N\n');
            console.log('⚠️  Interaction détectée - Envoi automatique de "N"');
        } else {
            process.stdout.write(output);
        }
    });
    
    serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        process.stderr.write(error);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`\nServeur arrêté avec le code: ${code}`);
        process.exit(code);
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Erreur lors du démarrage:', error.message);
        process.exit(1);
    });
    
    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
        console.log('\n🛑 Arrêt du serveur en cours...');
        serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Arrêt du serveur en cours...');
        serverProcess.kill('SIGTERM');
    });
    
} catch (error) {
    console.error('❌ Erreur critique:', error.message);
    process.exit(1);
}
