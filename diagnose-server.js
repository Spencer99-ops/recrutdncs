const { spawn } = require('child_process');
const fs = require('fs');

console.log('=== DIAGNOSTIC COMPLET DU SERVEUR ===\n');

// 1. Vérifier que server.js existe
if (!fs.existsSync('./server.js')) {
    console.error('ERREUR: server.js introuvable');
    process.exit(1);
}

// 2. Vérifier le fichier .env
if (!fs.existsSync('./.env')) {
    console.warn('AVERTISSEMENT: .env introuvable, utilisation des valeurs par défaut');
}

// 3. Tester la connexion à la base de données
async function testDatabaseConnection() {
    try {
        const mysql = require('mysql2/promise');
        require('dotenv').config();
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'recrutdncs'
        });
        
        console.log('Base de données: OK');
        await connection.end();
        return true;
    } catch (error) {
        console.error('Base de données: ERREUR -', error.message);
        return false;
    }
}

// 4. Démarrer le serveur avec logs détaillés
async function startServerWithLogs() {
    console.log('Démarrage du serveur avec logs détaillés...\n');
    
    const env = {
        ...process.env,
        MYSQL_PWD: process.env.DB_PASSWORD || '',
        NODE_ENV: 'production',
        MYSQL_NO_LOGIN_PROMPT: '1',
        DEBUG: 'app:*'
    };
    
    const server = spawn('node', ['server.js'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env,
        detached: false
    });
    
    let startTime = Date.now();
    let serverStarted = false;
    
    // Capturer les logs
    server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[STDOUT]', output.trim());
        
        // Vérifier si le serveur a démarré
        if (output.includes('Port: 3000') || output.includes('listening on port')) {
            serverStarted = true;
            console.log('\n=== SERVEUR DÉMARRÉ AVEC SUCCÈS ===');
            console.log('URL: http://localhost:3000');
            console.log('API: http://localhost:3000/api');
            
            // Tester la connexion après démarrage
            setTimeout(() => {
                testServerConnection();
            }, 2000);
        }
    });
    
    server.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('[STDERR]', error.trim());
        
        // Détecter les erreurs critiques
        if (error.includes('EADDRINUSE')) {
            console.error('\nERREUR: Port 3000 déjà utilisé');
            console.log('Solution: taskkill /F /IM node.exe');
        }
        
        if (error.includes('ENOTFOUND') || error.includes('ECONNREFUSED')) {
            console.error('\nERREUR: Problème de connexion à la base de données');
        }
    });
    
    server.on('error', (error) => {
        console.error('ERREUR CRITIQUE:', error.message);
        process.exit(1);
    });
    
    server.on('close', (code) => {
        console.log(`\nServeur arrêté (code: ${code})`);
        if (!serverStarted) {
            console.error('Le serveur n\'a pas pu démarrer correctement');
        }
        process.exit(code);
    });
    
    // Timeout après 10 secondes
    setTimeout(() => {
        if (!serverStarted) {
            console.error('\nTIMEOUT: Le serveur n\'a pas démarré dans les 10 secondes');
            server.kill();
            process.exit(1);
        }
    }, 10000);
    
    // Gérer l'arrêt
    process.on('SIGINT', () => {
        console.log('\nArrêt demandé...');
        server.kill('SIGINT');
    });
}

// 5. Tester la connexion au serveur
function testServerConnection() {
    const http = require('http');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api',
        method: 'GET',
        timeout: 3000
    };
    
    const req = http.request(options, (res) => {
        console.log('\n=== TEST DE CONNEXION ===');
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            console.log('CONNECTION: OK - Le serveur répond correctement');
            console.log('\n=== RÉSUMÉ FINAL ===');
            console.log('Serveur: Démarré et fonctionnel');
            console.log('URL: http://localhost:3000');
            console.log('API: http://localhost:3000/api');
            console.log('\nVous pouvez maintenant accéder à l\'application!');
        } else {
            console.log('CONNECTION: PARTIELLE - Status code différent de 200');
        }
        
        process.exit(0);
    });
    
    req.on('error', (error) => {
        console.error('\n=== TEST DE CONNEXION ===');
        console.error('CONNECTION: ERREUR -', error.message);
        process.exit(1);
    });
    
    req.on('timeout', () => {
        console.error('\n=== TEST DE CONNEXION ===');
        console.error('CONNECTION: TIMEOUT - Le serveur ne répond pas');
        req.destroy();
        process.exit(1);
    });
    
    req.end();
}

// Exécuter le diagnostic complet
async function runDiagnosis() {
    console.log('1. Vérification des fichiers: OK');
    
    const dbOk = await testDatabaseConnection();
    if (!dbOk) {
        console.error('\nERREUR: Problème de base de données détecté');
        console.log('Vérifiez que MySQL est démarré et que la base recrutdncs existe');
        process.exit(1);
    }
    
    console.log('\n2. Base de données: OK');
    console.log('\n3. Démarrage du serveur...\n');
    
    startServerWithLogs();
}

runDiagnosis();
