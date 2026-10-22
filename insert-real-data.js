const db = require('./config/database');
const bcrypt = require('bcrypt');

async function insertRealData() {
    console.log('=== Insertion des données réelles ===\n');
    
    try {
        // 1. Insérer des candidats supplémentaires
        const candidates = [
            {
                email: 'sophie.durant@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Durant',
                prenom: 'Sophie',
                telephone: '+33 6 23 45 67 89',
                role: 'candidat',
                bio: 'Développeuse Full Stack avec 4 ans d\'expérience spécialisée en React et Node.js. Passionnée par les projets innovants et l\'UX design.',
                location: 'Paris, France',
                experience: '3-5',
                job_title: 'Développeuse Full Stack',
                skills: 'React, Node.js, JavaScript, TypeScript, MongoDB, PostgreSQL, Git, Agile, UX/UI'
            },
            {
                email: 'martin.bernard@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Bernard',
                prenom: 'Martin',
                telephone: '+33 6 34 56 78 90',
                role: 'candidat',
                bio: 'Data Scientist avec expertise en machine learning et analyse de données. Recherche des défis dans le domaine de l\'IA.',
                location: 'Lyon, France',
                experience: '5-10',
                job_title: 'Data Scientist',
                skills: 'Python, R, Machine Learning, Deep Learning, TensorFlow, PyTorch, SQL, Data Visualization, Statistics'
            },
            {
                email: 'lucie.petit@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Petit',
                prenom: 'Lucie',
                telephone: '+33 6 45 67 89 01',
                role: 'candidat',
                bio: 'Designer UX/UI avec 3 ans d\'expérience dans la création d\'interfaces intuitives et modernes. Spécialisée en design mobile.',
                location: 'Marseille, France',
                experience: '1-3',
                job_title: 'Designer UX/UI',
                skills: 'Figma, Adobe XD, Sketch, Photoshop, Illustrator, Prototyping, User Research, Wireframing, Mobile Design'
            },
            {
                email: 'thomas.robert@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Robert',
                prenom: 'Thomas',
                telephone: '+33 6 56 78 90 12',
                role: 'candidat',
                bio: 'DevOps Engineer spécialisé dans les infrastructures cloud et l\'automatisation CI/CD. Expert Docker et Kubernetes.',
                location: 'Toulouse, France',
                experience: '5-10',
                job_title: 'DevOps Engineer',
                skills: 'Docker, Kubernetes, AWS, Azure, Jenkins, GitLab CI, Terraform, Ansible, Linux, Networking'
            },
            {
                email: 'emma.legrand@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Legrand',
                prenom: 'Emma',
                telephone: '+33 6 67 89 01 23',
                role: 'candidat',
                bio: 'Product Manager avec 6 ans d\'expérience dans la gestion de produits digitaux. Spécialisée en méthodes Agile.',
                location: 'Bordeaux, France',
                experience: '5-10',
                job_title: 'Product Manager',
                skills: 'Agile, Scrum, Product Strategy, User Stories, Roadmapping, Analytics, A/B Testing, Stakeholder Management, Market Research'
            },
            {
                email: 'nicolas.simon@email.com',
                password: await bcrypt.hash('admin123', 10),
                nom: 'Simon',
                prenom: 'Nicolas',
                telephone: '+33 6 78 90 12 34',
                role: 'candidat',
                bio: 'Backend Developer spécialisé en architectures microservices et APIs REST. Passionné par la performance et la scalabilité.',
                location: 'Lille, France',
                experience: '3-5',
                job_title: 'Backend Developer',
                skills: 'Java, Spring Boot, Node.js, Python, Microservices, REST APIs, GraphQL, MySQL, Redis, RabbitMQ'
            }
        ];

        console.log('Insertion des candidats...');
        for (const candidate of candidates) {
            try {
                const result = await db.createUser(candidate);
                console.log(`Candidat créé: ${candidate.email} (ID: ${result.insertId})`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`Candidat déjà existant: ${candidate.email}`);
                } else {
                    console.error(`Erreur pour ${candidate.email}:`, error.message);
                }
            }
        }

        // 2. Insérer des offres d'emploi réelles
        const jobs = [
            {
                title: 'Développeur Senior React',
                description: 'Nous recherchons un développeur React senior pour rejoindre notre équipe de développement frontend. Vous travaillerez sur des applications web modernes avec des technologies de pointe.',
                company: 'Tech Innovations',
                location: 'Paris, France',
                type_contrat: 'CDI',
                salaire: '45000-55000',
                requirements: 'React, JavaScript, TypeScript, Redux, 5+ ans d\'expérience',
                posted_by: 30,
                status: 'active'
            },
            {
                title: 'Data Scientist Junior',
                description: 'Opportunité parfaite pour un data scientist débutant de rejoindre notre équipe d\'analyse de données. Vous travaillerez sur des projets de machine learning concrets.',
                company: 'Data Analytics Pro',
                location: 'Lyon, France',
                type_contrat: 'CDI',
                salaire: '35000-42000',
                requirements: 'Python, R, Machine Learning basics, SQL, statistiques',
                posted_by: 30,
                status: 'active'
            },
            {
                title: 'Designer UX/UI',
                description: 'Nous cherchons un designer créatif pour améliorer l\'expérience utilisateur de nos applications mobiles et web. Portfolio requis.',
                company: 'Creative Studio',
                location: 'Marseille, France',
                type_contrat: 'CDI',
                salaire: '38000-45000',
                requirements: 'Figma, Adobe XD, 3+ ans d\'expérience, portfolio',
                posted_by: 31,
                status: 'active'
            },
            {
                title: 'DevOps Engineer',
                description: 'Rejoignez notre équipe DevOps pour automatiser et optimiser nos infrastructures cloud. Expérience avec Docker et Kubernetes requise.',
                company: 'Cloud Solutions',
                location: 'Toulouse, France',
                type_contrat: 'CDI',
                salaire: '48000-58000',
                requirements: 'Docker, Kubernetes, AWS, CI/CD, 3+ ans d\'expérience',
                posted_by: 31,
                status: 'active'
            },
            {
                title: 'Product Manager',
                description: 'Nous recherchons un Product Manager pour gérer notre roadmap produit et coordonner les équipes de développement.',
                company: 'Digital Products',
                location: 'Bordeaux, France',
                type_contrat: 'CDI',
                salaire: '50000-65000',
                requirements: 'Product Management, Agile, 5+ ans d\'expérience',
                posted_by: 32,
                status: 'active'
            },
            {
                title: 'Backend Developer Java',
                description: 'Développeur Java Spring Boot pour nos applications d\'entreprise. Architecture microservices.',
                company: 'Enterprise Systems',
                location: 'Lille, France',
                type_contrat: 'CDI',
                salaire: '42000-52000',
                requirements: 'Java, Spring Boot, Microservices, SQL, 3+ ans d\'expérience',
                posted_by: 32,
                status: 'active'
            }
        ];

        console.log('\nInsertion des offres d\'emploi...');
        for (const job of jobs) {
            try {
                const result = await db.createJob(job);
                console.log(`Offre créée: ${job.title} (ID: ${result.insertId})`);
                job.id = result.insertId;
            } catch (error) {
                console.error(`Erreur pour ${job.title}:`, error.message);
            }
        }

        // 3. Insérer des candidatures
        console.log('\nInsertion des candidatures...');
        const applications = [
            {
                job_id: jobs[0].id, // Développeur Senior React
                candidate_id: 33, // jean.dupont
                status: 'pending',
                cover_letter: 'Je suis très intéressé par votre offre de développeur React. Mon expérience correspond parfaitement à vos attentes.',
                cv_path: '/uploads/cvs/jean_dupont_cv.pdf'
            },
            {
                job_id: jobs[0].id, // Développeur Senior React
                candidate_id: 40, // sophie.durant
                status: 'accepted',
                cover_letter: 'Avec mes 4 ans d\'expérience en React, je pense pouvoir apporter une réelle valeur à votre équipe.',
                cv_path: '/uploads/cvs/sophie_durant_cv.pdf'
            },
            {
                job_id: jobs[1].id, // Data Scientist Junior
                candidate_id: 41, // martin.bernard
                status: 'rejected',
                cover_letter: 'Je suis passionné par le machine learning et votre entreprise représente exactement ce que je recherche.',
                cv_path: '/uploads/cvs/martin_bernard_cv.pdf'
            },
            {
                job_id: jobs[2].id, // Designer UX/UI
                candidate_id: 42, // lucie.petit
                status: 'pending',
                cover_letter: 'Mon portfolio montre mon expertise en design UX/UI et je serais ravi de contribuer à vos projets.',
                cv_path: '/uploads/cvs/lucie_petit_cv.pdf'
            },
            {
                job_id: jobs[3].id, // DevOps Engineer
                candidate_id: 43, // thomas.robert
                status: 'interview',
                cover_letter: 'Mon expérience en DevOps et cloud computing correspond parfaitement à vos besoins.',
                cv_path: '/uploads/cvs/thomas_robert_cv.pdf'
            }
        ];

        for (const application of applications) {
            try {
                const result = await db.createApplication(application);
                console.log(`Candidature créée: Job ${application.job_id} -> Candidat ${application.candidate_id}`);
            } catch (error) {
                console.error(`Erreur candidature:`, error.message);
            }
        }

        // 4. Insérer des notifications
        console.log('\nInsertion des notifications...');
        const notifications = [
            {
                user_id: 33,
                type: 'application',
                title: 'Candidature reçue',
                message: 'Votre candidature pour "Développeur Senior React" a été reçue.',
                related_id: jobs[0].id
            },
            {
                user_id: 40,
                type: 'application',
                title: 'Candidature acceptée',
                message: 'Félicitations ! Votre candidature pour "Développeur Senior React" a été acceptée.',
                related_id: jobs[0].id
            },
            {
                user_id: 41,
                type: 'application',
                title: 'Candidature refusée',
                message: 'Votre candidature pour "Data Scientist Junior" n\'a pas été retenue.',
                related_id: jobs[1].id
            },
            {
                user_id: 30,
                type: 'application',
                title: 'Nouvelle candidature',
                message: 'Vous avez reçu 2 nouvelles candidatures pour "Développeur Senior React".',
                related_id: jobs[0].id
            },
            {
                user_id: 31,
                type: 'application',
                title: 'Nouvelle candidature',
                message: 'Nouvelle candidature pour "Designer UX/UI" à examiner.',
                related_id: jobs[2].id
            }
        ];

        for (const notification of notifications) {
            try {
                await db.query(
                    'INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
                    [notification.user_id, notification.type, notification.title, notification.message, notification.related_id]
                );
                console.log(`Notification créée pour l'utilisateur ${notification.user_id}`);
            } catch (error) {
                console.error(`Erreur notification:`, error.message);
            }
        }

        console.log('\n=== Insertion des données terminée avec succès ! ===');
        
        // Afficher les statistiques
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'candidat') as total_candidates,
                (SELECT COUNT(*) FROM users WHERE role = 'recruteur') as total_recruiters,
                (SELECT COUNT(*) FROM users WHERE role = 'administrateur') as total_admins,
                (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
                (SELECT COUNT(*) FROM applications) as total_applications,
                (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications,
                (SELECT COUNT(*) FROM applications WHERE status = 'accepted') as accepted_applications,
                (SELECT COUNT(*) FROM applications WHERE status = 'rejected') as rejected_applications
        `);
        
        console.log('\n=== STATISTIQUES ACTUELLES ===');
        console.log(`Candidats: ${stats[0].total_candidates}`);
        console.log(`Recruteurs: ${stats[0].total_recruiters}`);
        console.log(`Administrateurs: ${stats[0].total_admins}`);
        console.log(`Offres actives: ${stats[0].active_jobs}`);
        console.log(`Total candidatures: ${stats[0].total_applications}`);
        console.log(`Candidatures en attente: ${stats[0].pending_applications}`);
        console.log(`Candidatures acceptées: ${stats[0].accepted_applications}`);
        console.log(`Candidatures refusées: ${stats[0].rejected_applications}`);
        
    } catch (error) {
        console.error('Erreur générale:', error);
    } finally {
        await db.close();
    }
}

insertRealData();
