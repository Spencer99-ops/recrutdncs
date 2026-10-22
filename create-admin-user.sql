-- Créer un utilisateur administrateur pour les tests
INSERT INTO users (id, nom, email, password, role, created_at, updated_at) 
VALUES (
    999, 
    'Admin Test', 
    'admin.test@recrutdncs.com', 
    '$2b$10$rQ8qK8qK8qK8qK8qK8qK8O', -- mot de passe: admin123
    'administrateur', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
nom = 'Admin Test', 
email = 'admin.test@recrutdncs.com', 
role = 'administrateur',
updated_at = NOW();
