const fs = require('fs');

function trouverEndpointsReels() {
    console.log('=== RECHERCHE DES 12 ENDPOINTS RÉELS ===\n');
    
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
                route: match[2],
                ligne: lignesServer.indexOf(ligne) + 1
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
    
    console.log('\n=== RECHERCHE DE CORRESPONDANCES EXACTES ===');
    
    // Chercher les correspondances exactes
    const endpointsFinale = [];
    const routesAPIReellesSet = new Set(routesAPIReelles.map(r => `${r.methode} ${r.route}`));
    
    endpointsRequis.forEach(requis => {
        const key = `${requis.methode} ${requis.route}`;
        
        if (routesAPIReellesSet.has(key)) {
            // Correspondance exacte trouvée
            endpointsFinale.push(requis);
            console.log(`  EXACT: ${requis.methode} ${requis.route} - ${requis.description}`);
        } else {
            // Chercher une alternative proche
            const alternatives = routesAPIReelles.filter(route => {
                // Même méthode et route similaire
                if (route.methode === requis.methode) {
                    const routeParts = route.route.split('/');
                    const requisParts = requis.route.split('/');
                    
                    // Comparer les parties principales
                    let similarite = 0;
                    for (let i = 0; i < Math.min(routeParts.length, requisParts.length); i++) {
                        if (routeParts[i] === requisParts[i]) {
                            similarite++;
                        }
                    }
                    
                    // Si au moins 2 parties correspondent, c'est une alternative
                    if (similarite >= 2) {
                        return true;
                    }
                }
                return false;
            });
            
            if (alternatives.length > 0) {
                // Utiliser la première alternative trouvée
                const alternative = alternatives[0];
                endpointsFinale.push({
                    ...requis,
                    routeReelle: alternative.route,
                    methodeReelle: alternative.methode
                });
                console.log(`  ALT: ${requis.methode} ${requis.route} -> ${alternative.methode} ${alternative.route} - ${requis.description}`);
            } else {
                console.log(`  MANQUE: ${requis.methode} ${requis.route} - ${requis.description}`);
            }
        }
    });
    
    console.log(`\n=== RÉSUMÉ DES ENDPOINTS FINAUX ===`);
    console.log(`Endpoints trouvés: ${endpointsFinale.length}/12`);
    
    // Si on n'a pas 12 endpoints, chercher d'autres routes pertinentes
    if (endpointsFinale.length < 12) {
        console.log(`\n=== COMPLÉMENT AVEC AUTRES ROUTES PERTINENTES ===`);
        
        const routesUtilisees = new Set(endpointsFinale.map(e => e.routeReelle || `${e.methode} ${e.route}`));
        
        // Routes API restantes qui pourraient être utiles
        const routesRestantes = routesAPIReelles.filter(route => {
            const key = `${route.methode} ${route.route}`;
            return !routesUtilisees.has(key);
        });
        
        // Ajouter les routes les plus pertinentes
        const routesPrioritaires = [
            '/api/auth/verify',
            '/api/auth/me',
            '/api/profile/:id',
            '/api/jobs/:id',
            '/api/applications/:id',
            '/api/admin/applications'
        ];
        
        routesRestantes.forEach(route => {
            if (endpointsFinale.length >= 12) return;
            
            const key = `${route.methode} ${route.route}`;
            
            // Vérifier si c'est une route prioritaire
            const estPrioritaire = routesPrioritaires.some(prio => route.route.includes(prio.replace('/api/', '')));
            
            if (estPrioritaire) {
                endpointsFinale.push({
                    methode: route.methode,
                    route: route.route,
                    description: `Route complémentaire: ${route.route}`,
                    estComplementaire: true
                });
                console.log(`  AJOUT: ${route.methode} ${route.route} - Route complémentaire`);
            }
        });
    }
    
    // Afficher les 12 endpoints finaux
    console.log(`\n=== LES 12 ENDPOINTS FINAUX SÉLECTIONNÉS ===`);
    endpointsFinale.slice(0, 12).forEach((endpoint, index) => {
        const route = endpoint.routeReelle || endpoint.route;
        const methode = endpoint.methodeReelle || endpoint.methode;
        console.log(`${index + 1}. ${methode} ${route} - ${endpoint.description}`);
    });
    
    return endpointsFinale.slice(0, 12);
}

// Appel de la fonction
trouverEndpointsReels();
