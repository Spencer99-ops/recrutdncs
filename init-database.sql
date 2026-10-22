-- Script d'initialisation de la base de données RECRUTDNCS
-- Exécutez ce script pour créer la base de données et insérer les données de test

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS recrutdncs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recrutdncs;

-- Table des utilisateurs (élargie pour tous les profils)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    role ENUM('candidat', 'recruteur', 'administrateur') NOT NULL DEFAULT 'candidat',
    bio TEXT,
    -- Champs spécifiques aux candidats
    location VARCHAR(255),
    experience VARCHAR(20),
    job_title VARCHAR(200),
    skills TEXT,
    avatar_path VARCHAR(255),
    cv_path VARCHAR(255),
    cover_letter_path VARCHAR(255),
    -- Champs spécifiques aux recruteurs
    company_name VARCHAR(100),
    company_sector VARCHAR(100),
    company_size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des offres d'emploi (élargie)
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    entreprise VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    type_contrat ENUM('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel') NOT NULL,
    salaire_min DECIMAL(10,2),
    salaire_max DECIMAL(10,2),
    remote BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    status ENUM('active', 'inactive', 'draft', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des candidatures (élargie)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cv_path VARCHAR(255),
    cover_letter_path VARCHAR(255),
    message_motivation TEXT,
    statut ENUM('en_attente', 'en_revue', 'entretien', 'accepte', 'refuse') NOT NULL DEFAULT 'en_attente',
    interview_date DATETIME,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
);

-- Table des documents (pour gestion centralisée)
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('cv', 'cover_letter', 'avatar') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('application_status', 'new_job_match', 'interview_scheduled', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des statistiques (pour le dashboard admin)
CREATE TABLE IF NOT EXISTS statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value INT NOT NULL,
    metric_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_statut ON applications(statut);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insertion d'un administrateur par défaut (mot de passe: admin123)
INSERT IGNORE INTO users (email, password, nom, prenom, role, bio) 
VALUES ('admin@recrutdncs.com', '$2b$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Administrateur', 'Admin', 'administrateur', 'Administrateur principal de la plateforme RECRUTDNCS');

-- Insertion d'un recruteur de test
INSERT IGNORE INTO users (email, password, nom, prenom, telephone, role, bio, company_name, company_sector, company_size) 
VALUES ('recruteur@techcompany.com', '$2b$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Tech Company', 'Recruteur', '+33 1 23 45 67 89', 'recruteur', 
'Entreprise spécialisée dans le développement web et les technologies digitales.', 
'Tech Company SAS', 'Informatique', '50-100');

-- Insertion de candidats de test
INSERT IGNORE INTO users (email, password, nom, prenom, telephone, role, bio, location, experience, job_title, skills) 
VALUES 
('jean.dupont@email.com', '$2b$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Dupont', 'Jean', '+33 6 12 34 56 78', 'candidat', 
'Développeur web passionné avec 5 ans d''expérience en React et Node.js. Je recherche activement de nouveaux défis techniques dans une entreprise innovante.', 
'Paris', '3-5', 'Développeur Full Stack', 
'React, JavaScript, TypeScript, Node.js, Express, MongoDB, PostgreSQL, Git, Docker, AWS, CI/CD'),

('marie.martin@email.com', '$2b$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Martin', 'Marie', '+33 7 98 76 54 32', 'candidat', 
'Designer UX/UX créative avec 3 ans d''expérience. Spécialisée en design thinking et prototypage rapide.', 
'Lyon', '1-3', 'UX Designer', 
'Figma, Adobe XD, Sketch, Design Thinking, Prototypage, User Research, Wireframing, CSS, HTML basique'),

('pierre.bernard@email.com', '$2b$10$rOzJqQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Bernard', 'Pierre', '+33 6 55 44 33 22', 'candidat', 
'Étudiant en informatique à la recherche d''un stage pour développer mes compétences en développement web.', 
'Marseille', '0-1', 'Étudiant Développeur', 
'HTML, CSS, JavaScript, React, Git, Méthodes agiles, Communication, Travail d''équipe');

-- Insertion d'offres d'emploi par le recruteur
INSERT IGNORE INTO jobs (titre, description, requirements, benefits, entreprise, location, type_contrat, salaire_min, salaire_max, remote, user_id, status) VALUES 
('Développeur Frontend Senior', 
'Nous recherchons un développeur frontend senior pour rejoindre notre équipe R&D. Vous travaillerez sur des projets innovants pour nos clients Fortune 500.', 
'React expert, TypeScript, 5+ ans d''expérience, Node.js, Git, CI/CD, Tests unitaires, Performance web', 
'Télétravail 3 jours/semaine, Mutuelle santé, RTT, Formation continue, Tickets restaurant', 
'Tech Company', 'Paris', 'CDI', 45000.00, 65000.00, TRUE, 2, 'active'),

('Développeur Full Stack', 
'Poste polyvalent pour développer nos applications web full stack. Vous travaillerez sur toute la stack technique du frontend au backend.', 
'JavaScript/TypeScript, React, Node.js, Express, MongoDB/PostgreSQL, 3+ ans d''expérience, Docker, AWS', 
'Flexibilité horaires, Remote possible, Prime de panier-repas, Assurance complémentaire', 
'Tech Company', 'Lyon', 'CDI', 40000.00, 55000.00, TRUE, 2, 'active'),

('Designer UI/UX Junior', 
'Opportunité parfaite pour les designers juniors de développer leurs compétences sur des projets réels.', 
'Figma, Adobe XD, Design Thinking, Créativité, 1+ an d''expérience, Portfolio', 
'Formation continue, Mentorat par designer senior, Équipement de qualité, Ambiance créative', 
'Tech Company', 'Marseille', 'CDD', 35000.00, 42000.00, FALSE, 2, 'active');

-- Insertion de candidatures
INSERT IGNORE INTO applications (job_id, user_id, cv_path, cover_letter_path, message_motivation, statut) VALUES 
(1, 3, '/uploads/cv/jean_dupont_cv.pdf', '/uploads/cover_letters/jean_dupont_lm.pdf', 
'Je suis très intéressé par votre offre de développeur frontend senior. Mon expérience en React et TypeScript correspond parfaitement à vos besoins.', 'en_attente'),

(2, 4, '/uploads/cv/marie_martin_cv.pdf', '/uploads/cover_letters/marie_martin_lm.pdf', 
'Votre offre de développeur full stack m''attire car elle me permettrait d''utiliser toutes mes compétences techniques.', 'en_revue'),

(3, 5, '/uploads/cv/pierre_bernard_cv.pdf', '/uploads/cover_letters/pierre_bernard_lm.pdf', 
'En tant qu''étudiant passionné, je serais ravi d''apprendre et de contribuer à vos projets UI/UX.', 'entretien');

-- Insertion de documents pour les candidats
INSERT IGNORE INTO documents (user_id, type, file_name, file_path, file_size, mime_type) VALUES 
(3, 'cv', 'jean_dupont_cv.pdf', '/uploads/cv/jean_dupont_cv.pdf', 245760, 'application/pdf'),
(3, 'cover_letter', 'jean_dupont_lm.pdf', '/uploads/cover_letters/jean_dupont_lm.pdf', 125890, 'application/pdf'),
(4, 'cv', 'marie_martin_cv.pdf', '/uploads/cv/marie_martin_cv.pdf', 189450, 'application/pdf'),
(4, 'cover_letter', 'marie_martin_lm.pdf', '/uploads/cover_letters/marie_martin_lm.pdf', 98760, 'application/pdf'),
(5, 'cv', 'pierre_bernard_cv.pdf', '/uploads/cv/pierre_bernard_cv.pdf', 156780, 'application/pdf');

-- Insertion de notifications
INSERT IGNORE INTO notifications (user_id, type, title, message) VALUES 
(3, 'application_status', 'Candidature en attente', 'Votre candidature pour "Développeur Frontend Senior" est en cours de révision.'),
(4, 'new_job_match', 'Nouvelle offre correspondante', 'Nouvelle offre "Développeur Full Stack" correspond à votre profil.'),
(5, 'interview_scheduled', 'Entretien planifié', 'Un entretien est prévu pour votre candidature "Designer UI/UX Junior".');

-- Insertion de statistiques pour le dashboard admin
INSERT IGNORE INTO statistics (metric_name, metric_value, metric_date) VALUES 
('total_users', 6, CURRENT_DATE),
('total_jobs', 3, CURRENT_DATE),
('total_applications', 3, CURRENT_DATE),
('active_jobs', 3, CURRENT_DATE),
('pending_applications', 1, CURRENT_DATE),
('interviews_scheduled', 1, CURRENT_DATE);

-- Affichage des informations de la base de données créée
SELECT 'Base de données RECRUTDNCS initialisée avec succès!' AS message;
SELECT 'Total utilisateurs:' AS info, COUNT(*) AS total FROM users;
SELECT 'Total offres d''emploi:' AS info, COUNT(*) AS total FROM jobs;
SELECT 'Total candidatures:' AS info, COUNT(*) AS total FROM applications;
