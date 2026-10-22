const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    try {
        console.log('=== Initialisation de la base de données ===');
        
        // Connexion à MySQL sans spécifier de base de données
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('Connexion à MySQL réussie');
        
        // Créer la base de données si elle n'existe pas
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'recrutdncs'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Base de données ${process.env.DB_NAME || 'recrutdncs'} créée ou déjà existante`);
        
        // Se connecter à la base de données
        await connection.changeUser({ database: process.env.DB_NAME || 'recrutdncs' });
        
        // Lire et exécuter le fichier SQL
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'database.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Exécuter les commandes SQL
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('Commande exécutée avec succès');
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.error('Erreur lors de l\'exécution de la commande:', error.message);
                    }
                }
            }
        }
        
        console.log('=== Base de données initialisée avec succès ===');
        
        // Vérifier que les tables existent
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables créées:', tables.map(table => Object.values(table)[0]));
        
        await connection.end();
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        process.exit(1);
    }
}

// Exécuter l'initialisation
initializeDatabase();
