const fs = require('fs');

function analyserCahierCharges() {
    console.log('=== ANALYSE DU CAHIER DES CHARGES RECRUTDNCS ===\n');
    
    // Lire server.js pour extraire les routes réelles
    const serverPath = 'server.js';
    let contenuServer = '';
    
    try {
        contenuServer = fs.readFileSync(serverPath, 'utf8');
        console.log('1. Lecture de server.js: OK');
    } catch (error) {
        console.log('1. Lecture de server.js: ERREUR -', error.message);
        return;
    }
    
    // Extraire les routes réelles de server.js
    const routesReelles = [];
    const lignesServer = contenuServer.split('\n');
    
    for (const ligne of lignesServer) {
        const match = ligne.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (match) {
            routesReelles.push({
                methode: match[1].toUpperCase(),
                route: match[2]
            });
        }
    }
    
    console.log(`2. Routes réelles trouvées dans server.js: ${routesReelles.length}`);
    
    // Filtrer les routes API seulement (commençant par /api/)
    const routesAPIReelles = routesReelles.filter(route => route.route.startsWith('/api/'));
    console.log(`3. Routes API réelles: ${routesAPIReelles.length}`);
    
    // Les 12 endpoints requis selon le cahier des charges
    const endpointsRequis = [
        { methode: 'POST', route: '/api/auth/register', description: 'Inscription' },
        { methode: 'POST', route: '/api/auth/login', description: 'Connexion' },
        { methode: 'PUT', route: '/api/profile/me', description: 'Mise à jour du Profil' },
        { methode: 'GET', route: '/api/jobs', description: 'Lister les Offres' },
        { methode: 'POST', route: '/api/jobs', description: 'Créer une Offre' },
        { methode: 'PUT', route: '/api/jobs/:id', description: 'Modifier une Offre' },
        { methode: 'DELETE', route: '/api/jobs/:id', description: 'Supprimer une Offre' },
        { methode: 'POST', route: '/api/apply/:jobId', description: 'Postuler' },
        { methode: 'GET', route: '/api/applications', description: 'Lister les Candidatures' },
        { methode: 'PATCH', route: '/api/applications/:id/status', description: 'Changer le Statut' },
        { methode: 'GET', route: '/api/admin/users', description: 'Gestion des Utilisateurs' },
        { methode: 'DELETE', route: '/api/admin/users/:id', description: 'Modération de Compte' }
    ];
    
    console.log('\n=== ENDPOINTS REQUIS SELON LE CAHIER DES CHARGES ===');
    endpointsRequis.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.methode} ${endpoint.route} - ${endpoint.description}`);
    });
    
    // Vérifier quels endpoints requis existent réellement
    console.log('\n=== VÉRIFICATION DES ENDPOINTS REQUIS ===');
    const routesReellesSet = new Set(routesAPIReelles.map(r => `${r.methode} ${r.route}`));
    
    let endpointsExistants = [];
    let endpointsManquants = [];
    
    endpointsRequis.forEach(endpoint => {
        const key = `${endpoint.methode} ${endpoint.route}`;
        if (routesReellesSet.has(key)) {
            endpointsExistants.push(endpoint);
            console.log(`  EXISTE: ${endpoint.methode} ${endpoint.route}`);
        } else {
            endpointsManquants.push(endpoint);
            console.log(`  MANQUANT: ${endpoint.methode} ${endpoint.route}`);
        }
    });
    
    console.log(`\nRésumé:`);
    console.log(`- Endpoints requis: ${endpointsRequis.length}`);
    console.log(`- Endpoints existants: ${endpointsExistants.length}`);
    console.log(`- Endpoints manquants: ${endpointsManquants.length}`);
    
    // Si des endpoints manquent, chercher des alternatives proches
    if (endpointsManquants.length > 0) {
        console.log(`\n=== RECHERCHE D'ALTERNATIVES POUR LES ENDPOINTS MANQUANTS ===`);
        
        endpointsManquants.forEach(manquant => {
            console.log(`\nRecherche pour: ${manquant.methode} ${manquant.route}`);
            
            // Chercher des routes similaires
            const alternatives = routesAPIReelles.filter(route => {
                const routeKey = `${route.methode} ${route.route}`;
                
                // Vérifier si la méthode correspond et si la route est similaire
                if (route.methode === manquant.methode) {
                    // Vérifier si la route contient les mêmes mots-clés
                    const routeParts = route.route.split('/');
                    const manquantParts = manquant.route.split('/');
                    
                    // Comparer les parties principales
                    let similarite = 0;
                    for (let i = 0; i < Math.min(routeParts.length, manquantParts.length); i++) {
                        if (routeParts[i] === manquantParts[i]) {
                            similarite++;
                        }
                    }
                    
                    // Si au moins 2 parties correspondent, c'est une alternative potentielle
                    if (similarite >= 2) {
                        return true;
                    }
                }
                
                return false;
            });
            
            if (alternatives.length > 0) {
                console.log(`  Alternatives trouvées:`);
                alternatives.forEach(alt => {
                    console.log(`    -> ${alt.methode} ${alt.route}`);
                });
            } else {
                console.log(`  Aucune alternative trouvée`);
            }
        });
    }
    
    return {
        endpointsRequis,
        endpointsExistants,
        endpointsManquants,
        routesAPIReelles
    };
}

// Appel de la fonction
analyseCahierCharges();
