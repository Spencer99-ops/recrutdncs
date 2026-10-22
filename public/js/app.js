class RecrutDNCS {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.loginAttempts = 0;
        this.blockedUntil = null;
        
        this.init();
    }

    async init() {
        // Forcer l'affichage du header au démarrage
        this.forceHeaderDisplay();
        
        // Vérifier si l'utilisateur est déjà connecté au chargement de la page
        if (this.token) {
            try {
                const response = await this.apiRequest('/auth/me', 'GET');
                this.currentUser = response.data.user;
                // Si connecté, aller directement au dashboard
                this.showDashboard(response.data.user.role);
                return; // Sortir early pour ne pas afficher la page d'accueil
            } catch (error) {
                console.error('Token invalide:', error);
                this.logout(); // Nettoyer le token invalide
            }
        }

        // Si non connecté, afficher la page d'accueil par défaut
        this.showPage('home');

        // Initialiser les écouteurs d'événements
        this.setupEventListeners();
        this.setupDashboardTabs();
        this.setupLogoutButton();
        
        // Vérifier si on est sur la page de connexion et initialiser le bouton d'inscription
        setTimeout(() => {
            const roleSelect = document.getElementById('role');
            if (roleSelect && roleSelect.value) {
                this.toggleRegisterButton(roleSelect.value);
            }
        }, 100);
    }

    // Forcer l'affichage du header
    forceHeaderDisplay() {
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) {
            // S'assurer que le header est visible
            mainHeader.style.display = 'block';
            mainHeader.style.visibility = 'visible';
            mainHeader.style.opacity = '1';
            console.log('Header forcé à être visible');
        }
    }

    setupEventListeners() {
        // Navigation principale
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Trouver l'élément parent si nécessaire
                const targetElement = e.target.closest('.nav-link');
                if (targetElement && targetElement.dataset.page) {
                    const page = targetElement.dataset.page;
                    console.log(`Navigation vers: ${page}`);
                    this.showPage(page);
                }
            });
        });

        // Connexion
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Vérification robuste des éléments
                const emailElement = document.getElementById('email');
                const passwordElement = document.getElementById('password');
                
                if (!emailElement || !passwordElement) {
                    console.error('Éléments du formulaire non trouvés');
                    this.showLoginError('Erreur de formulaire. Veuillez réessayer.');
                    return;
                }
                
                const email = emailElement.value || '';
                const password = passwordElement.value || '';
                
                if (!email || !password) {
                    this.showLoginError('Veuillez remplir tous les champs');
                    return;
                }
                
                this.login(email, password);
            });
        }

        // Sélecteur de rôle
        const roleSelect = document.getElementById('role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                this.toggleRegisterButton(e.target.value);
            });
        }

        // Bouton d'inscription
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showPage('register');
            });
        }

        // Formulaire d'inscription
        const candidateForm = document.getElementById('candidate-form');
        if (candidateForm) {
            candidateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('register-nom').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm').value;
                
                if (this.validateCandidateForm(name, email, password, confirmPassword)) {
                    this.registerCandidate(name, email, password);
                }
            });
        }

        // Validation des mots de passe en temps réel
        const registerPassword = document.getElementById('register-password');
        const registerConfirm = document.getElementById('register-confirm');
        
        if (registerPassword && registerConfirm) {
            registerPassword.addEventListener('input', () => {
                this.validatePasswordMatch(registerPassword.value, registerConfirm.value);
            });
            
            registerConfirm.addEventListener('input', () => {
                this.validatePasswordMatch(registerPassword.value, registerConfirm.value);
            });
        }

        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Bouton de déconnexion admin
        const logoutBtnAdmin = document.getElementById('logout-btn-admin');
        if (logoutBtnAdmin) {
            logoutBtnAdmin.addEventListener('click', () => {
                this.logout();
            });
        }

        // Formulaire de profil
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Formulaire de profil recruteur
        const recruteurProfileForm = document.getElementById('recruteur-profile-form');
        if (recruteurProfileForm) {
            recruteurProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateRecruteurProfile();
            });
        }
    }

    validateCandidateForm(name, email, password, confirmPassword) {
        // Validation du nom
        if (!name || name.trim().length < 2) {
            this.showRegisterError('Le nom doit contenir au moins 2 caractères');
            return false;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            this.showRegisterError('Veuillez entrer une adresse email valide');
            return false;
        }

        // Validation du mot de passe
        if (!password || password.length < 8) {
            this.showRegisterError('Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }

        // Validation de la confirmation
        if (password !== confirmPassword) {
            this.showRegisterError('Les mots de passe ne correspondent pas');
            return false;
        }

        this.hideRegisterError();
        return true;
    }

    validatePasswordMatch(password, confirmPassword) {
        const confirmElement = document.getElementById('register-confirm');
        const registerError = document.getElementById('register-error');
        
        if (!confirmElement || !registerError) return;
        
        if (confirmPassword && password !== confirmPassword) {
            registerError.textContent = 'Les mots de passe ne correspondent pas';
            registerError.style.display = 'block';
            confirmElement.style.borderColor = 'var(--danger-color)';
        } else if (confirmPassword && password === confirmPassword && password.length >= 8) {
            registerError.style.display = 'none';
            confirmElement.style.borderColor = 'var(--success-color)';
        } else {
            registerError.style.display = 'none';
            confirmElement.style.borderColor = '';
        }
    }

    validatePassword(password) {
        const passwordElement = document.getElementById('register-password');
        const registerError = document.getElementById('register-error');
        
        if (!passwordElement || !registerError) return;
        
        if (password.length > 0 && password.length < 8) {
            registerError.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
            registerError.style.display = 'block';
            passwordElement.style.borderColor = 'var(--danger-color)';
        } else if (password.length === 0) {
            registerError.style.display = 'none';
            passwordElement.style.borderColor = '';
        } else {
            registerError.style.display = 'none';
            passwordElement.style.borderColor = 'var(--success-color)';
        }
    }

    toggleRegisterButton(role) {
        const toggleBtn = document.getElementById('toggle-register-btn');
        const loginRight = document.getElementById('login-right');
        const registerForm = document.getElementById('candidate-form');
        
        // Supprimer l'ancien bouton s'il existe
        const oldBtn = document.getElementById('register-btn');
        if (oldBtn) {
            oldBtn.remove();
        }
        
        if (role === 'candidat') {
            if (!toggleBtn) {
                const btn = document.createElement('button');
                btn.id = 'toggle-register-btn';
                btn.className = 'btn btn-outline';
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <path d="M20 8v6M23 11h-6"></path>
                    </svg>
                    Formulaire d'inscription
                `;
                btn.style.marginTop = '1rem';
                btn.style.width = '100%';
                btn.onclick = () => window.location.href = 'register.html';
                
                // Ajouter après le sélecteur de rôle
                const roleSelect = document.getElementById('role');
                if (roleSelect) {
                    roleSelect.parentNode.insertBefore(btn, roleSelect.nextSibling);
                }
            }
        } else {
            if (toggleBtn) {
                toggleBtn.remove();
            }
            // Revenir au formulaire de connexion normal
            if (loginRight && registerForm) {
                registerForm.style.display = 'none';
                loginRight.style.display = 'block';
            }
        }
    }

    showRegisterForm() {
        const loginRight = document.getElementById('login-right');
        const registerForm = document.getElementById('candidate-form');
        const toggleBtn = document.getElementById('toggle-register-btn');
        
        if (loginRight && registerForm) {
            // Transformer le bloc de droite en formulaire d'inscription
            loginRight.style.display = 'none';
            registerForm.style.display = 'block';
            
            // Mettre à jour le bouton de transformation
            if (toggleBtn) {
                toggleBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12,19 5,12 12,5"></polyline>
                    </svg>
                    Retour à la connexion
                `;
                toggleBtn.onclick = () => this.hideRegisterForm();
            }
        }
    }

    hideRegisterForm() {
        const loginRight = document.getElementById('login-right');
        const registerForm = document.getElementById('candidate-form');
        const toggleBtn = document.getElementById('toggle-register-btn');
        
        if (loginRight && registerForm) {
            // Revenir au formulaire de connexion
            registerForm.style.display = 'none';
            loginRight.style.display = 'block';
            
            // Mettre à jour le bouton de transformation
            if (toggleBtn) {
                toggleBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <path d="M20.84 4.61a6 6 0 1 1.42V6a2 2 0 0 0-2-2h-2.58a6 6 0 0 0-1.42V4.61A6 6 0 0 0 1.42 18.58l6.58 6.58H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.58a6 6 0 0 0-1.42V4.61A6 6 0 0 0 1.42 18.58z"></path>
                    </svg>
                    Formulaire d'inscription
                `;
                toggleBtn.onclick = () => this.showRegisterForm();
            }
        }
    }

    async apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBase}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur réseau');
            }
            
            return responseData;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Vérifier si l'utilisateur est bloqué
            if (this.blockedUntil && Date.now() < this.blockedUntil) {
                const remainingTime = Math.ceil((this.blockedUntil - Date.now()) / 60000);
                this.showLoginError(`Compte temporairement bloqué. Réessayez dans ${remainingTime} minute(s).`);
                return;
            }

            // Validation des champs
            if (!email || !password) {
                this.showLoginError('Veuillez remplir tous les champs.');
                return;
            }

            if (!this.validateEmail(email)) {
                this.showLoginError('Veuillez entrer une adresse email valide.');
                return;
            }

            if (password.length < 6) {
                this.showLoginError('Le mot de passe doit contenir au moins 6 caractères.');
                return;
            }

            const response = await this.apiRequest('/auth/login', 'POST', {
                email,
                password
            });

            if (response.success) {
                this.token = response.data.token;
                this.currentUser = response.data.user;
                localStorage.setItem('token', this.token);
                
                // Réinitialiser les tentatives
                this.loginAttempts = 0;
                this.blockedUntil = null;
                
                // Rediriger vers le dashboard selon le rôle
                window.location.href = '/dashboard.html';
            } else {
                this.handleLoginFailure(response.message);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showLoginError('Erreur de connexion. Veuillez réessayer.');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleLoginFailure(message) {
        this.loginAttempts++;
        
        if (this.loginAttempts >= 3) {
            // Bloquer pour 5 minutes et rediriger vers l'accueil
            this.blockedUntil = Date.now() + (5 * 60 * 1000);
            this.showLoginError('Trop de tentatives échouées. Vous êtes temporairement bloqué. Redirection vers l\'accueil...');
            
            // Afficher un message d'erreur pendant 10 secondes puis rediriger
            setTimeout(() => {
                this.showPage('home');
                this.showNotification('Compte bloqué pour 5 minutes. Veuillez réessayer plus tard.', 'error');
            }, 3000);
        } else {
            const remainingAttempts = 3 - this.loginAttempts;
            this.showLoginError(`${message || 'Email ou mot de passe incorrect.'} (${remainingAttempts} tentative(s) restante(s))`);
        }
    }

    showLoginSingle() {
        const singleBlock = document.getElementById('login-single');
        const splitBlock = document.getElementById('login-split');
        const registerForm = document.getElementById('register-form');
        
        // Afficher le bloc unique, cacher le bloc divisé et le formulaire d'inscription
        if (singleBlock) singleBlock.style.display = 'block';
        if (splitBlock) splitBlock.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
    }

    showLoginForm() {
        const singleBlock = document.getElementById('login-single');
        const splitBlock = document.getElementById('login-split');
        
        // Afficher le bloc divisé, cacher le bloc unique
        if (singleBlock) singleBlock.style.display = 'none';
        if (splitBlock) splitBlock.style.display = 'flex';
        
        // Cacher la page d'inscription
        const registerPage = document.getElementById('register-page');
        if (registerPage) {
            registerPage.classList.add('hidden');
            registerPage.style.display = 'none';
        }
    }

    showRegisterForm() {
        const singleBlock = document.getElementById('login-single');
        const splitBlock = document.getElementById('login-split');
        
        // Cacher tous les blocs de connexion, afficher la page d'inscription
        if (singleBlock) singleBlock.style.display = 'none';
        if (splitBlock) splitBlock.style.display = 'none';
        
        // Afficher la page d'inscription complète
        this.showPage('register');
    }

    showLoginError(message, showWarning = false) {
        const errorContainer = document.getElementById('login-error-container');
        const loginError = document.getElementById('login-error');
        const attemptWarning = document.getElementById('attempt-warning');
        
        if (errorContainer && loginError) {
            loginError.textContent = message;
            errorContainer.style.display = 'block';
            
            // Animation de secousse pour l'erreur
            errorContainer.style.animation = 'none';
            setTimeout(() => {
                errorContainer.style.animation = 'shake 0.5s ease-in-out';
            }, 10);
        }
        
        if (attemptWarning && showWarning) {
            attemptWarning.style.display = 'block';
        }
    }

    hideLoginError() {
        const errorContainer = document.getElementById('login-error-container');
        const loginError = document.getElementById('login-error');
        const attemptWarning = document.getElementById('attempt-warning');
        
        if (errorContainer) errorContainer.style.display = 'none';
        if (loginError) loginError.textContent = '';
        if (attemptWarning) attemptWarning.style.display = 'none';
    }

    hideRegisterError() {
        const registerError = document.getElementById('register-error');
        if (registerError) {
            registerError.style.display = 'none';
            registerError.textContent = '';
        }
    }

    showRegisterError(message) {
        const registerError = document.getElementById('register-error');
        if (registerError) {
            registerError.textContent = message;
            registerError.style.display = 'block';
        }
    }

    async registerCandidate(name, email, password) {
        try {
            const response = await this.apiRequest('/auth/register', 'POST', {
                nom: name,
                email: email,
                password: password,
                role: 'candidat'
            });
            
            this.showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
            this.hideRegisterForm();
            
            // Afficher le formulaire de connexion
            this.showLoginForm();
        } catch (error) {
            this.showRegisterError(error.message || 'Erreur lors de l\'inscription');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        
        // Cacher tous les dashboards
        this.hideAllDashboards();
        
        // Afficher la page de connexion
        this.showPage('login');
        
        this.showNotification('Déconnexion réussie', 'info');
    }

    showDashboard(role) {
        // Cacher toutes les pages
        this.hideAllPages();
        
        // Afficher le dashboard approprié
        const dashboardMap = {
            'candidat': 'dashboard-candidat',
            'recruteur': 'dashboard-recruteur',
            'administrateur': 'dashboard-admin'
        };
        
        const dashboardId = dashboardMap[role];
        if (dashboardId) {
            const dashboard = document.getElementById(dashboardId);
            if (dashboard) {
                dashboard.classList.remove('hidden');
                dashboard.style.display = 'block';
                
                // Initialiser les données spécifiques au rôle
                this.initializeDashboardData(role);
            }
        }
    }

    hideAllDashboards() {
        const dashboards = ['dashboard-candidat', 'dashboard-recruteur', 'dashboard-admin'];
        dashboards.forEach(id => {
            const dashboard = document.getElementById(id);
            if (dashboard) {
                dashboard.classList.add('hidden');
                dashboard.style.display = 'none';
            }
        });
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.add('hidden');
            page.style.display = 'none';
        });
    }

    initializeDashboardData(role) {
        switch(role) {
            case 'candidat':
                this.initializeCandidateDashboard();
                break;
            case 'recruteur':
                this.initializeRecruteurDashboard();
                break;
            case 'administrateur':
                this.initializeAdminDashboard();
                break;
        }
    }

    initializeCandidateDashboard() {
        // Simuler des données pour le candidat
        this.updateElement('candidatures-count', '12');
        this.updateElement('entretiens-count', '3');
        this.updateElement('offres-count', '45');
        this.updateElement('profile-completion', '75%');
    }

    initializeRecruteurDashboard() {
        // Simuler des données pour le recruteur
        this.updateElement('offres-postees-count', '8');
        this.updateElement('candidatures-recues-count', '24');
        this.updateElement('entretiens-planifies-count', '6');
        this.updateElement('taux-conversion', '15%');
    }

    initializeAdminDashboard() {
        // Simuler des données pour l'admin
        this.updateElement('total-users-count', '156');
        this.updateElement('total-jobs-count', '89');
        this.updateElement('total-applications-count', '342');
        this.updateElement('activite-mensuelle', '28');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateProfile() {
        const nom = document.getElementById('profile-nom').value;
        const email = document.getElementById('profile-email').value;
        const telephone = document.getElementById('profile-telephone').value;
        const bio = document.getElementById('profile-bio').value;
        
        console.log('Profil mis à jour:', { nom, email, telephone, bio });
        this.showNotification('Profil mis à jour avec succès', 'success');
    }

    updateRecruteurProfile() {
        const entreprise = document.getElementById('entreprise-nom').value;
        const email = document.getElementById('entreprise-email').value;
        const telephone = document.getElementById('entreprise-telephone').value;
        const description = document.getElementById('entreprise-description').value;
        
        console.log('Profil recruteur mis à jour:', { entreprise, email, telephone, description });
        this.showNotification('Profil entreprise mis à jour avec succès', 'success');
    }

    // Navigation entre les pages
    showPage(pageName) {
        console.log(`showPage appelée avec: ${pageName}`);
        
        // Cacher toutes les pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.add('hidden');
            page.style.display = 'none';
        });
        
        // Afficher la page cible
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            console.log(`Page trouvée: ${pageName}-page`);
            targetPage.classList.remove('hidden');
            targetPage.style.display = 'block';
            targetPage.classList.add('fade-in');
            
            // Forcer le reflow pour s'assurer que la page est visible
            targetPage.offsetHeight;
        } else {
            console.error(`Page non trouvée: ${pageName}-page`);
        }

        // Gérer l'affichage du header selon la page
        const mainHeader = document.getElementById('main-header');
        if (mainHeader) {
            // Garder le header visible pour les pages informatives ET la page profils MAIS PAS pour connexion et inscription
            if (pageName === 'home' || pageName === 'profiles' || pageName === 'contact' || pageName === 'register') {
                mainHeader.style.display = 'block';
                console.log('Header affiché pour la page:', pageName);
            } else {
                mainHeader.style.display = 'none';
                console.log('Header caché pour la page:', pageName);
            }
        }

        // Gérer l'état de la page de connexion
        if (pageName === 'login') {
            document.body.classList.add('login-page-active');
            
            // Initialiser le bouton d'inscription après un court délai
            setTimeout(() => {
                const roleSelect = document.getElementById('role');
                if (roleSelect && roleSelect.value) {
                    this.toggleRegisterButton(roleSelect.value);
                }
            }, 200);
        } else {
            document.body.classList.remove('login-page-active');
        }

        // Gérer les dashboards spécifiques
        this.hideAllDashboards();
        
        // Mettre à jour la navigation avec un petit délai
        setTimeout(() => {
            this.updateNavigation();
        }, 50);
    }

    updateNavigation() {
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach(item => item.classList.remove('active'));
        
        const currentPageElement = document.querySelector('.page:not(.hidden)');
        if (currentPageElement && currentPageElement.id) {
            const currentPage = currentPageElement.id;
            const activeLink = document.querySelector(`[data-page="${currentPage.replace('-page', '')}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    showDashboardTabs() {
        // Afficher les onglets du dashboard selon le rôle
        const role = this.currentUser?.role;
        if (!role) return;
        
        const tabs = {
            'candidat': ['overview', 'profile', 'applications', 'messages', 'settings'],
            'recruteur': ['overview', 'jobs', 'applications', 'profile', 'settings'],
            'administrateur': ['overview', 'users', 'jobs', 'applications', 'statistics', 'settings']
        };
        
        const roleTabs = tabs[role] || [];
        const allTabs = document.querySelectorAll('.sidebar-link');
        
        allTabs.forEach(tab => {
            const tabName = tab.dataset.tab;
            if (roleTabs.includes(tabName)) {
                tab.style.display = 'block';
            } else {
                tab.style.display = 'none';
            }
        });
    }

    setupDashboardTabs() {
        // Gestion des onglets pour tous les dashboards
        const tabLinks = document.querySelectorAll('.sidebar-link[data-tab]');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.dataset.tab;
                
                // Retirer la classe active de tous les liens
                tabLinks.forEach(l => l.classList.remove('active'));
                
                // Ajouter la classe active au lien cliqué
                link.classList.add('active');
                
                // Masquer tous les contenus
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Afficher le contenu cible
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }
            });
        });
        
        // Afficher le premier onglet par défaut
        const firstTab = document.querySelector('.sidebar-link[data-tab]');
        if (firstTab) {
            firstTab.click();
        }
    }

    toggleRegistrationForm(role) {
        const candidateRegister = document.getElementById('candidate-register');
        const registerForm = document.getElementById('register-form');
        
        // Vérifier si les éléments existent avant d'y accéder
        if (candidateRegister) {
            if (role === 'candidat') {
                candidateRegister.style.display = 'block';
            } else {
                candidateRegister.style.display = 'none';
            }
        }
        
        if (registerForm) {
            registerForm.style.display = 'none';
        }
    }

    // Méthodes pour les dashboards
    showDashboard(role) {
        // Masquer tous les dashboards
        document.querySelectorAll('.dashboard-content').forEach(dashboard => {
            dashboard.style.display = 'none';
        });
        
        // Afficher le dashboard approprié
        const dashboardElement = document.getElementById(`${role}-dashboard`);
        if (dashboardElement) {
            dashboardElement.style.display = 'block';
        }
        
        // Mettre à jour les infos utilisateur
        this.updateUserInfo();
        
        // Afficher le header
        this.showHeader();
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.nom || 'Utilisateur';
        }
        
        if (userRoleElement && this.currentUser) {
            const roleLabels = {
                'candidat': 'Candidat',
                'recruteur': 'Recruteur',
                'administrateur': 'Administrateur'
            };
            userRoleElement.textContent = roleLabels[this.currentUser.role] || this.currentUser.role;
        }
    }

    // Actions du dashboard
    showProfile() {
        this.showNotification('Profil en cours de développement', 'info');
    }

    showApplications() {
        this.showNotification('Candidatures en cours de développement', 'info');
    }

    showJobs() {
        this.showNotification('Offres en cours de développement', 'info');
    }

    showMyJobs() {
        this.showNotification('Mes offres en cours de développement', 'info');
    }

    showCreateJob() {
        this.showNotification('Création d\'offre en cours de développement', 'info');
    }

    showUsers() {
        this.showNotification('Gestion des utilisateurs en cours de développement', 'info');
    }

    showAllJobs() {
        this.showNotification('Toutes les offres en cours de développement', 'info');
    }

    showAllApplications() {
        this.showNotification('Toutes les candidatures en cours de développement', 'info');
    }

    showStats() {
        this.showNotification('Statistiques en cours de développement', 'info');
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    logout() {
        // Supprimer le token et les infos utilisateur
        localStorage.removeItem('token');
        this.token = null;
        this.currentUser = null;
        
        // Rediriger vers la page d'accueil
        window.location.href = '/';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'accepté':
            case 'acceptee':
                return 'success';
            case 'refusé':
            case 'refusee':
                return 'danger';
            case 'en attente':
            case 'en cours':
                return 'warning';
            default:
                return 'info';
        }
    }
}

// Initialiser l'application
const app = new RecrutDNCS();
