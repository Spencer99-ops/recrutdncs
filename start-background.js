const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== DÉMARRAGE DU SERVEUR EN ARRIÈRE-PLAN ===\n');

// Vérifier que le fichier server.js existe
if (!fs.existsSync('./server.js')) {
    console.error('❌ Erreur: server.js introuvable');
    process.exit(1);
}

// Configuration pour éviter les interactions MySQL
const env = {
    ...process.env,
    MYSQL_PWD: process.env.DB_PASSWORD || '',
    NODE_ENV: 'production',
    // Forcer le mode non interactif
    MYSQL_NO_LOGIN_PROMPT: '1'
};

console.log('🚀 Démarrage du serveur en arrière-plan...');
console.log('📍 URL: http://localhost:3000');
console.log('🔗 API: http://localhost:3000/api');
console.log('⚙️  Configuration MySQL appliquée');
console.log('========================================\n');

try {
    // Démarrer le serveur en arrière-plan avec detached: true
    const server = spawn('node', ['server.js'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        env: env,
        detached: true,
        shell: false
    });
    
    // Détacher le processus pour qu'il continue en arrière-plan
    server.unref();
    
    console.log('✅ Serveur démarré en arrière-plan (PID:', server.pid, ')');
    console.log('🌐 Serveur accessible sur: http://localhost:3000');
    console.log('📊 API accessible sur: http://localhost:3000/api');
    console.log('🛑 Pour arrêter: taskkill /F /IM node.exe');
    console.log('');
    console.log('📝 Logs du serveur:');
    console.log('   - Consultez la console pour voir les logs');
    console.log('   - Le serveur continue de tourner en arrière-plan');
    
    // Quitter le script de démarrage
    setTimeout(() => {
        console.log('✨ Démarrage terminé - Le serveur tourne en arrière-plan');
        process.exit(0);
    }, 2000);
    
} catch (error) {
    console.error('❌ Erreur critique:', error.message);
    process.exit(1);
}
