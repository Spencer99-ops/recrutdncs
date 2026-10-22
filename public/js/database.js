// Simulation de base de données pour RECRUTDNCS
class Database {
    constructor() {
        this.users = [];
        this.applications = [];
        this.jobs = [];
        this.init();
    }

    init() {
        // Charger les données depuis localStorage ou utiliser des données par défaut
        const savedUsers = localStorage.getItem('recrutdncs_users');
        const savedApplications = localStorage.getItem('recrutdncs_applications');
        const savedJobs = localStorage.getItem('recrutdncs_jobs');
        
        this.users = savedUsers ? JSON.parse(savedUsers) : this.getDefaultUsers();
        this.applications = savedApplications ? JSON.parse(savedApplications) : [];
        this.jobs = savedJobs ? JSON.parse(savedJobs) : this.getDefaultJobs();
    }

    // Méthode pour synchroniser avec la base de données SQL
    syncWithSQL() {
        // Vider le localStorage et recharger avec les données SQL
        localStorage.removeItem('recrutdncs_users');
        this.users = this.getDefaultUsers();
        this.save();
        console.log('Base de données synchronisée avec les données SQL');
    }

    getDefaultUsers() {
        return [
            {
                id: 2,
                nom: "Entreprise Tech",
                email: "recruteur@example.com",
                password: "$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
                role: "recruteur",
                telephone: "0123456789",
                bio: null,
                createdAt: "2026-04-15 01:32:25",
                updatedAt: "2026-04-15 01:32:25"
            },
            {
                id: 3,
                nom: "Jean Dupont",
                email: "candidat@example.com",
                password: "$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
                role: "candidat",
                telephone: "0612345678",
                bio: null,
                createdAt: "2026-04-15 01:32:25",
                updatedAt: "2026-04-15 01:32:25"
            },
            {
                id: 5,
                nom: "Administrateur",
                email: "admin@recrutdncs.com",
                password: "$2b$10$KUc/JehQroAowYgv/yQZL.JOriufYkUjiwxxEIsn98pvwPpTx/4YS",
                role: "administrateur",
                telephone: null,
                bio: null,
                createdAt: "2026-04-15 01:57:27",
                updatedAt: "2026-04-15 01:57:27"
            },
            {
                id: 6,
                nom: "Candidat Test",
                email: "candidat@test.com",
                password: "$2b$10$jw/6rv6UDaGlxFpFzud04uHCrMS7h8pYg/fZ4GjhbEh0uOwdDMufS",
                role: "candidat",
                telephone: "0123456789",
                bio: null,
                createdAt: "2026-04-15 02:51:28",
                updatedAt: "2026-04-15 02:51:28"
            },
            {
                id: 7,
                nom: "Recruteur Test",
                email: "recruteur@test.com",
                password: "$2b$10$Dyb/5kdY9sina87m/lW7r.n5HXM8nILHovI.UOXXUQcJuxbfwcz2m",
                role: "recruteur",
                telephone: "0123456789",
                bio: null,
                createdAt: "2026-04-15 02:51:28",
                updatedAt: "2026-04-15 02:51:28"
            },
            {
                id: 8,
                nom: "Admin Test",
                email: "admin@test.com",
                password: "$2b$10$n6UUZc/2Vpynn.28UqAgze8/mKdMzqKs6NXJJyUd8L2G6kVe74Jnq",
                role: "administrateur",
                telephone: "0123456789",
                bio: null,
                createdAt: "2026-04-15 02:51:28",
                updatedAt: "2026-04-15 02:51:28"
            },
            {
                id: 9,
                nom: "Test User",
                email: "test@example.com",
                password: "$2b$10$.G5pPdpLlmRPitnbsB7paeIIYVLkV0.21KGL5OO/Ej6tcju/sPqji",
                role: "candidat",
                telephone: null,
                bio: null,
                createdAt: "2026-04-15 03:14:49",
                updatedAt: "2026-04-15 03:14:49"
            }
        ];
    }

    getDefaultJobs() {
        return [
            {
                id: 1,
                title: "Développeur Full Stack Senior",
                company: "TechCorp",
                location: "Paris, France",
                type: "CDI",
                experience: "5+",
                salary: "60k-80k€",
                description: "Nous recherchons un développeur expérimenté...",
                skills: ["JavaScript", "React", "Node.js", "MongoDB"],
                postedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Designer UX/UI",
                company: "Creative Studio",
                location: "Lyon, France",
                type: "CDI",
                experience: "3-5",
                salary: "45k-60k€",
                description: "Studio créatif recherche un designer talentueux...",
                skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
                postedAt: new Date().toISOString()
            }
        ];
    }

    save() {
        localStorage.setItem('recrutdncs_users', JSON.stringify(this.users));
        localStorage.setItem('recrutdncs_applications', JSON.stringify(this.applications));
        localStorage.setItem('recrutdncs_jobs', JSON.stringify(this.jobs));
    }

    // Méthodes pour les utilisateurs
    createUser(userData) {
        // Générer un ID unique (max ID existant + 1)
        const maxId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) : 0;
        const newId = maxId + 1;
        
        const newUser = {
            id: newId,
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.users.push(newUser);
        this.save();
        return newUser;
    }

    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    getUserById(id) {
        return this.users.find(user => user.id === parseInt(id));
    }

    updateUser(id, updates) {
        const userIndex = this.users.findIndex(user => user.id === parseInt(id));
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.save();
        }
        return this.users[userIndex];
    }

    // Méthodes pour les candidatures
    createApplication(applicationData) {
        const newApplication = {
            id: this.applications.length + 1,
            ...applicationData,
            status: "en attente",
            createdAt: new Date().toISOString()
        };
        this.applications.push(newApplication);
        this.save();
        return newApplication;
    }

    getApplicationsByUserId(userId) {
        return this.applications.filter(app => app.userId === parseInt(userId));
    }

    updateApplicationStatus(id, status) {
        const appIndex = this.applications.findIndex(app => app.id === parseInt(id));
        if (appIndex !== -1) {
            this.applications[appIndex].status = status;
            this.save();
        }
        return this.applications[appIndex];
    }

    // Méthodes pour les offres d'emploi
    getJobs() {
        return this.jobs;
    }

    getJobById(id) {
        return this.jobs.find(job => job.id === parseInt(id));
    }

    createJob(jobData) {
        const newJob = {
            id: this.jobs.length + 1,
            ...jobData,
            postedAt: new Date().toISOString()
        };
        this.jobs.push(newJob);
        this.save();
        return newJob;
    }

    // Méthodes utilitaires
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    hashPassword(password) {
        // Simulation de hashage (en production, utiliser bcrypt ou similaire)
        return btoa(password + 'salt');
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }
}

// Instance globale de la base de données
const db = new Database();
