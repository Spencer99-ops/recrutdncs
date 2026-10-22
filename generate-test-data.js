const bcrypt = require('bcryptjs');

// Générer des hash pour les mots de passe de test
async function generateHashes() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash pour admin123:', hash);
}

generateHashes();
