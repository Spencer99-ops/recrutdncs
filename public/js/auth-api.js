// Integration de l'API pour les pages d'authentification
// Remplace les données mock par des appels API réels

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        
        // Page d'inscription
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Afficher un indicateur de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        submitBtn.disabled = true;

        try {
            const response = await api.login(loginData.email, loginData.password);
            
            if (response.success) {
                window.showNotification('Connexion réussie!', 'success');
                
                // Rediriger selon le rôle
                setTimeout(() => {
                    this.redirectToDashboard(response.user.role);
                }, 1000);
            } else {
                window.showNotification(response.message || 'Erreur de connexion', 'error');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            window.showNotification('Erreur de connexion', 'error');
        } finally {
            // Restaurer le bouton
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister() {
        const form = document.getElementById('register-form');
        const formData = new FormData(form);
        
        const registerData = {
            email: formData.get('email'),
            password: formData.get('password'),
            nom: formData.get('nom'),
            telephone: formData.get('telephone') || '',
            role: 'candidat', // Forcer le rôle candidat
            bio: formData.get('bio') || '',
            location: formData.get('location') || '',
            experience: formData.get('experience') || '',
            job_title: formData.get('job_title') || '',
            skills: formData.get('skills') || ''
        };

        // Validation des mots de passe
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        
        if (password !== confirmPassword) {
            window.showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        // Afficher un indicateur de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
        submitBtn.disabled = true;

        try {
            const response = await api.register(registerData);
            
            if (response.success) {
                window.showNotification('Inscription réussie! Bienvenue dans l\'espace candidat', 'success');
                
                // Rediriger vers le dashboard candidat
                setTimeout(() => {
                    window.location.href = '/profile-candidat.html';
                }, 1000);
            } else {
                window.showNotification(response.message || 'Erreur d\'inscription', 'error');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            window.showNotification('Erreur d\'inscription', 'error');
        } finally {
            // Restaurer le bouton
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    
    redirectToDashboard(role) {
        let dashboardUrl = '/dashboard.html';

        switch (role) {
            case 'candidat':
                dashboardUrl = '/profile-candidat.html';
                break;
            case 'recruteur':
                dashboardUrl = '/dashboard-recruteur.html';
                break;
            case 'administrateur':
                dashboardUrl = '/admin.html';
                break;
            default:
                dashboardUrl = '/dashboard.html';
        }

        window.location.href = dashboardUrl;
    }

    async checkAuthStatus() {
        if (api.currentUser) {
            // Utilisateur déjà connecté, rediriger vers le bon dashboard
            this.redirectToDashboard(api.currentUser.role);
        }
    }

    // Déconnexion
    async logout() {
        try {
            await api.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            api.clearAuth();
            window.showNotification('Déconnexion réussie', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
        }
    }
}

// Initialiser le gestionnaire d'authentification
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Rendre la fonction logout disponible globalement
window.logout = () => {
    const authManager = new AuthManager();
    authManager.logout();
};

// Validation des formulaires
document.addEventListener('DOMContentLoaded', () => {
    // Validation du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const email = loginForm.querySelector('input[type="email"]');
            const password = loginForm.querySelector('input[type="password"]');
            
            let isValid = true;

            // Validation email
            if (!email.value || !email.value.includes('@')) {
                email.classList.add('error');
                isValid = false;
            } else {
                email.classList.remove('error');
            }

            // Validation mot de passe
            if (!password.value || password.value.length < 6) {
                password.classList.add('error');
                isValid = false;
            } else {
                password.classList.remove('error');
            }

            if (!isValid) {
                e.preventDefault();
                window.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            }
        });
    }

    // Validation du formulaire d'inscription
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const email = registerForm.querySelector('input[type="email"]');
            const password = registerForm.querySelector('input[name="password"]');
            const confirmPassword = registerForm.querySelector('input[name="confirm_password"]');
            const nom = registerForm.querySelector('input[name="nom"]');
            const role = registerForm.querySelector('select[name="role"]');
            
            let isValid = true;

            // Validation email
            if (!email.value || !email.value.includes('@')) {
                email.classList.add('error');
                isValid = false;
            } else {
                email.classList.remove('error');
            }

            // Validation nom
            if (!nom.value || nom.value.length < 2) {
                nom.classList.add('error');
                isValid = false;
            } else {
                nom.classList.remove('error');
            }

            // Validation mot de passe
            if (!password.value || password.value.length < 6) {
                password.classList.add('error');
                isValid = false;
            } else {
                password.classList.remove('error');
            }

            // Validation confirmation mot de passe
            if (confirmPassword && password.value !== confirmPassword.value) {
                confirmPassword.classList.add('error');
                isValid = false;
            } else if (confirmPassword) {
                confirmPassword.classList.remove('error');
            }

            // Validation rôle
            if (!role.value) {
                role.classList.add('error');
                isValid = false;
            } else {
                role.classList.remove('error');
            }

            if (!isValid) {
                e.preventDefault();
                window.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            }
        });
    }

    // Ajouter des styles pour les champs en erreur
    const errorStyles = document.createElement('style');
    errorStyles.textContent = `
        input.error, select.error, textarea.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
    `;
    document.head.appendChild(errorStyles);
});
