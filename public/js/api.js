// API Service pour RECRUTDNCS
// Ce fichier gère toutes les communications avec le backend

class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    // Méthodes utilitaires
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur réseau');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentification
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.token) {
            this.setToken(response.token);
            this.setCurrentUser(response.user);
        }

        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.token) {
            this.setToken(response.token);
            this.setCurrentUser(response.user);
        }

        return response;
    }

    async getCurrentUser() {
        if (!this.token) return null;

        try {
            const response = await this.request('/auth/me');
            return response.user;
        } catch (error) {
            this.clearAuth();
            return null;
        }
    }

    // Jobs
    async getJobs(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';

        const response = await this.request(endpoint);
        return response.jobs || [];
    }

    async getJobById(id) {
        const response = await this.request(`/jobs/${id}`);
        return response.job;
    }

    async createJob(jobData) {
        const response = await this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });

        return response.job;
    }

    async updateJob(id, jobData) {
        const response = await this.request(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });

        return response.job;
    }

    async deleteJob(id) {
        const response = await this.request(`/jobs/${id}`, {
            method: 'DELETE'
        });

        return response;
    }

    // Applications
    async getApplications() {
        const response = await this.request('/applications');
        return response.applications || [];
    }

    async createApplication(applicationData) {
        const response = await this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });

        return response.application;
    }

    async updateApplicationStatus(id, status) {
        const response = await this.request(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        return response.application;
    }

    // Profile
    async getProfile() {
        const response = await this.request('/profile');
        return response.user;
    }

    async updateProfile(profileData) {
        const response = await this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        return response.user;
    }

    // Documents
    async getDocuments() {
        const response = await this.request('/profile/documents');
        return response.documents || [];
    }

    async uploadDocument(formData) {
        const response = await this.request('/profile/documents', {
            method: 'POST',
            body: formData,
            headers: {
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            }
        });

        return response.document;
    }

    async deleteDocument(id) {
        const response = await this.request(`/profile/documents/${id}`, {
            method: 'DELETE'
        });

        return response;
    }

    // Notifications
    async getNotifications(unreadOnly = false) {
        const endpoint = unreadOnly ? '/notifications?unread=true' : '/notifications';
        const response = await this.request(endpoint);
        return response.notifications || [];
    }

    async markNotificationAsRead(id) {
        const response = await this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });

        return response;
    }

    async deleteNotification(id) {
        const response = await this.request(`/notifications/${id}`, {
            method: 'DELETE'
        });

        return response;
    }

    // Admin
    async getStatistics() {
        const response = await this.request('/admin/statistics');
        return response.statistics || {};
    }

    async getAllUsers() {
        const response = await this.request('/admin/users');
        return response.users || [];
    }

    async updateUserRole(id, role) {
        const response = await this.request(`/admin/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });

        return response.user;
    }

    async deleteUser(id) {
        const response = await this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });

        return response;
    }
}

// Instance globale de l'API
const api = new ApiService();

// Fonctions utilitaires pour le frontend
window.api = api;
window.showNotification = function(message, type = 'info') {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto-suppression après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Ajouter les animations CSS
const apiStyles = document.createElement('style');
apiStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(apiStyles);

// Vérifier l'authentification au chargement
document.addEventListener('DOMContentLoaded', async () => {
    if (api.token) {
        try {
            const user = await api.getCurrentUser();
            if (user) {
                api.setCurrentUser(user);
            } else {
                api.clearAuth();
            }
        } catch (error) {
            api.clearAuth();
        }
    }
});
