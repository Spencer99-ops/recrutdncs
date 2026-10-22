const fs = require('fs');

function analyserRoutesRapport() {
    console.log('=== ANALYSE DES ROUTES PRÉSENTES DANS LE RAPPORT VS RÉALITÉ ===\n');
    
    // Lire le rapport corrigé
    const rapportPath = 'RAPPORT_RECRUTDNCS_CORRIGE.md';
    let contenuRapport = '';
    
    try {
        contenuRapport = fs.readFileSync(rapportPath, 'utf8');
        console.log('1. Lecture du rapport corrigé: OK');
    } catch (error) {
        console.log('1. Lecture du rapport corrigé: ERREUR -', error.message);
        return;
    }
    
    // Lire server.js pour extraire les routes réelles
    const serverPath = 'server.js';
    let contenuServer = '';
    
    try {
        contenuServer = fs.readFileSync(serverPath, 'utf8');
        console.log('2. Lecture de server.js: OK');
    } catch (error) {
        console.log('2. Lecture de server.js: ERREUR -', error.message);
        return;
    }
    
    // Extraire les routes du rapport
    const routesRapport = [];
    const lignesRapport = contenuRapport.split('\n');
    
    for (const ligne of lignesRapport) {
        const match = ligne.match(/\|\s*\d+\s*\|\s*(GET|POST|PUT|DELETE|PATCH)\s*\|\s*(\/[^\s]+)/);
        if (match) {
            routesRapport.push({
                methode: match[1],
                route: match[2]
            });
        }
    }
    
    console.log(`3. Routes trouvées dans le rapport: ${routesRapport.length}`);
    
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
    
    console.log(`4. Routes réelles trouvées dans server.js: ${routesReelles.length}`);
    
    // Filtrer les routes API seulement (commençant par /api/)
    const routesAPIReelles = routesReelles.filter(route => route.route.startsWith('/api/'));
    console.log(`5. Routes API réelles: ${routesAPIReelles.length}`);
    
    // Afficher les routes du rapport
    console.log('\n=== ROUTES PRÉSENTES DANS LE RAPPORT ===');
    routesRapport.forEach((route, index) => {
        console.log(`${index + 1}. ${route.methode} ${route.route}`);
    });
    
    // Afficher les routes API réelles
    console.log('\n=== ROUTES API RÉELLES ===');
    routesAPIReelles.forEach((route, index) => {
        console.log(`${index + 1}. ${route.methode} ${route.route}`);
    });
    
    // Comparer les routes
    console.log('\n=== ANALYSE DES ÉCARTS ===');
    
    const routesRapportSet = new Set(routesRapport.map(r => `${r.methode} ${r.route}`));
    const routesReellesSet = new Set(routesAPIReelles.map(r => `${r.methode} ${r.route}`));
    
    // Routes dans le rapport mais pas dans la réalité
    const routesManquantes = routesRapport.filter(r => !routesReellesSet.has(`${r.methode} ${r.route}`));
    console.log(`\nRoutes dans le rapport mais PAS dans la réalité (${routesManquantes.length}):`);
    routesManquantes.forEach((route, index) => {
        console.log(`  ${index + 1}. ${route.methode} ${route.route}`);
    });
    
    // Routes réelles mais pas dans le rapport
    const routesNonDocumentees = routesAPIReelles.filter(r => !routesRapportSet.has(`${r.methode} ${r.route}`));
    console.log(`\nRoutes réelles mais PAS dans le rapport (${routesNonDocumentees.length}):`);
    routesNonDocumentees.forEach((route, index) => {
        console.log(`  ${index + 1}. ${route.methode} ${route.route}`);
    });
    
    // Routes communes
    const routesCommunes = routesRapport.filter(r => routesReellesSet.has(`${r.methode} ${r.route}`));
    console.log(`\nRoutes communes (correctement documentées) (${routesCommunes.length}):`);
    routesCommunes.forEach((route, index) => {
        console.log(`  ${index + 1}. ${route.methode} ${route.route}`);
    });
    
    // Résumé
    console.log('\n=== RÉSUMÉ ===');
    console.log(`Total routes dans le rapport: ${routesRapport.length}`);
    console.log(`Total routes API réelles: ${routesAPIReelles.length}`);
    console.log(`Routes correctement documentées: ${routesCommunes.length}`);
    console.log(`Routes manquantes dans la réalité: ${routesManquantes.length}`);
    console.log(`Routes non documentées: ${routesNonDocumentees.length}`);
    
    const tauxDocumentation = ((routesCommunes.length / routesAPIReelles.length) * 100).toFixed(1);
    console.log(`Taux de documentation: ${tauxDocumentation}%`);
    
    // Recommandations
    console.log('\n=== RECOMMANDATIONS ===');
    if (routesManquantes.length > 0) {
        console.log('- Corriger les routes qui n\'existent pas dans la réalité');
    }
    if (routesNonDocumentees.length > 0) {
        console.log('- Ajouter les routes manquantes dans le rapport');
    }
    
    return {
        routesRapport,
        routesAPIReelles,
        routesCommunes,
        routesManquantes,
        routesNonDocumentees
    };
}

analyserRoutesRapport();
