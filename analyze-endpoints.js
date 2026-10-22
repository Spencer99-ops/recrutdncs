const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

async function analyzeEndpoints() {
    console.log('=== ANALYSE DÉTAILLÉE DES ENDPOINTS AVEC ERREURS 500 ===\n');
    
    // Créer tokens de test
    const adminUser = {
        id: 999,
        email: 'admin@recrutdncs.com',
        role: 'administrateur'
    };
    
    const candidateUser = {
        id: 33,
        email: 'jean.dupont@email.com',
        role: 'candidat'
    };
    
    const adminToken = jwt.sign(adminUser, 'your_super_secret_jwt_key_here_change_in_production', { expiresIn: '1h' });
    const candidateToken = jwt.sign(candidateUser, 'your_super_secret_jwt_key_here_change_in_production', { expiresIn: '1h' });
    
    console.log('Tokens créés:');
    console.log('Admin Token:', adminToken.substring(0, 50) + '...');
    console.log('Candidate Token:', candidateToken.substring(0, 50) + '...\n');
    
    // Liste des endpoints à analyser
    const endpoints = [
        {
            name: '/api/users/33',
            method: 'GET',
            url: 'http://localhost:3000/api/users/33',
            token: adminToken,
            description: 'Récupérer les informations utilisateur ID 33'
        },
        {
            name: '/api/candidate/profile/33',
            method: 'GET', 
            url: 'http://localhost:3000/api/candidate/profile/33',
            token: adminToken,
            description: 'Récupérer le profil candidat ID 33'
        },
        {
            name: '/api/candidate/profile/34',
            method: 'GET',
            url: 'http://localhost:3000/api/candidate/profile/34', 
            token: adminToken,
            description: 'Récupérer le profil candidat ID 34'
        }
    ];
    
    // Analyser chaque endpoint
    for (const endpoint of endpoints) {
        console.log(`\n=== ANALYSE DE ${endpoint.name} ===`);
        console.log(`Description: ${endpoint.description}`);
        console.log(`URL: ${endpoint.url}`);
        console.log(`Méthode: ${endpoint.method}`);
        
        try {
            const startTime = Date.now();
            
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: {
                    'Authorization': `Bearer ${endpoint.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`Status: ${response.status}`);
            console.log(`Response Time: ${responseTime}ms`);
            console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log(`Response Body:`, responseText);
            
            // Analyser la réponse
            if (response.status === 500) {
                console.log('\n=== ERREUR 500 DÉTECTÉE ===');
                
                // Essayer de parser la réponse JSON
                try {
                    const jsonResponse = JSON.parse(responseText);
                    console.log('Message d\'erreur:', jsonResponse.message);
                    
                    // Analyser les causes possibles
                    if (jsonResponse.message === 'Erreur serveur') {
                        console.log('\nCAUSES POSSIBLES:');
                        console.log('1. Erreur de base de données (colonne manquante, table inexistante)');
                        console.log('2. Erreur de syntaxe SQL');
                        console.log('3. Erreur de connexion à la base de données');
                        console.log('4. Erreur dans le code de l\'endpoint');
                        console.log('5. Problème de validation des données');
                    }
                } catch (parseError) {
                    console.log('Réponse non-JSON:', responseText);
                    console.log('\nCAUSES POSSIBLES:');
                    console.log('1. Erreur de syntaxe JavaScript non gérée');
                    console.log('2. Exception non capturée');
                    console.log('3. Erreur dans le middleware');
                }
            } else if (response.status === 404) {
                console.log('\n=== ERREUR 404 DÉTECTÉE ===');
                console.log('CAUSES POSSIBLES:');
                console.log('1. Endpoint non défini');
                console.log('2. Route incorrecte');
                console.log('3. Méthode HTTP non supportée');
            } else if (response.ok) {
                console.log('\n=== SUCCÈS ===');
                try {
                    const jsonResponse = JSON.parse(responseText);
                    console.log('Données retournées:', JSON.stringify(jsonResponse, null, 2));
                } catch (parseError) {
                    console.log('Réponse brute:', responseText);
                }
            }
            
        } catch (error) {
            console.log('\n=== ERREUR RÉSEAU ===');
            console.log('Erreur:', error.message);
            console.log('CAUSES POSSIBLES:');
            console.log('1. Serveur non démarré');
            console.log('2. Port incorrect');
            console.log('3. Problème de réseau');
            console.log('4. Timeout');
        }
        
        console.log('\n' + '='.repeat(50));
    }
    
    // Analyse des logs du serveur si possible
    console.log('\n=== ANALYSE DES LOGS SERVEUR ===');
    console.log('Pour analyser les logs du serveur, vérifiez:');
    console.log('1. Les logs dans la console du serveur');
    console.log('2. Les fichiers de logs (server.log, error.log)');
    console.log('3. Les erreurs dans le middleware d\'erreur');
    
    console.log('\n=== RECOMMANDATIONS ===');
    console.log('1. Ajouter des logs détaillés dans chaque endpoint');
    console.log('2. Utiliser try-catch avec des messages d\'erreur spécifiques');
    console.log('3. Valider les paramètres avant les requêtes SQL');
    console.log('4. Vérifier l\'existence des tables et colonnes');
    console.log('5. Tester les requêtes SQL directement dans la base de données');
}

analyzeEndpoints().catch(console.error);
