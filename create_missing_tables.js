const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMissingTables() {
    console.log('=== CRÉATION DES TABLES MANQUANTES ===\n');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'recrutdncs'
    });
    
    try {
        console.log('1. Connexion à la base de données: OK');
        
        // Créer la table saved_jobs
        console.log('2. Création de la table saved_jobs...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                job_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                UNIQUE KEY unique_saved_job (user_id, job_id)
            )
        `);
        console.log('   Table saved_jobs créée avec succès');
        
        // Vérifier la table
        const [savedJobs] = await connection.execute('SHOW TABLES LIKE "saved_jobs"');
        console.log(`   Vérification: ${savedJobs.length > 0 ? 'OK' : 'ÉCHEC'}`);
        
        // Créer la table notifications si elle n'existe pas
        console.log('3. Création de la table notifications...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type ENUM('application_status', 'new_job_match', 'interview_scheduled', 'system') NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('   Table notifications créée avec succès');
        
        // Vérifier la table
        const [notifications] = await connection.execute('SHOW TABLES LIKE "notifications"');
        console.log(`   Vérification: ${notifications.length > 0 ? 'OK' : 'ÉCHEC'}`);
        
        console.log('\n=== RÉSUMÉ ===');
        console.log('Tables créées avec succès!');
        console.log('- saved_jobs: OK');
        console.log('- notifications: OK');
        console.log('\nLes erreurs 500 sur /api/candidate/save-job devraient être résolues.');
        
    } catch (error) {
        console.error('Erreur lors de la création des tables:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

createMissingTables();
