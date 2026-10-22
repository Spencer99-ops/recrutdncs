// Integration de l'API pour le dashboard administrateur
// Remplace les données mock par des appels API réels

class AdminDashboard {
    constructor() {
        this.statistics = {};
        this.users = [];
        this.jobs = [];
        this.applications = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadDashboardData();
    }

    bindEvents() {
        // Navigation dans le dashboard
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Gestion des utilisateurs
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-user-btn')) {
                const userId = e.target.dataset.userId;
                await this.deleteUser(userId);
            }

            if (e.target.classList.contains('edit-role-btn')) {
                const userId = e.target.dataset.userId;
                this.openRoleModal(userId);
            }
        });

        // Modal de modification de rôle
        document.getElementById('role-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateUserRole();
        });

        // Rafraîchir les statistiques
        document.getElementById('refresh-stats')?.addEventListener('click', async () => {
            await this.loadStatistics();
        });

        // Export des données
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadStatistics(),
                this.loadUsers(),
                this.loadJobs(),
                this.loadApplications()
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            window.showNotification('Erreur lors du chargement des données du dashboard', 'error');
        }
    }

    async loadStatistics() {
        try {
            this.statistics = await api.getStatistics();
            this.renderStatistics();
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    async loadUsers() {
        try {
            this.users = await api.getAllUsers();
            this.renderUsers();
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        }
    }

    async loadJobs() {
        try {
            // Charger tous les jobs (y compris inactifs)
            this.jobs = await api.getJobs({ include_inactive: true });
            this.renderJobs();
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
        }
    }

    async loadApplications() {
        try {
            this.applications = await api.getApplications();
            this.renderApplications();
        } catch (error) {
            console.error('Erreur lors du chargement des candidatures:', error);
        }
    }

    renderStatistics() {
        const stats = this.statistics;
        
        // Mettre à jour les cartes de statistiques
        this.updateStatCard('total-users', stats.total_users || 0);
        this.updateStatCard('total-jobs', stats.total_jobs || 0);
        this.updateStatCard('total-applications', stats.total_applications || 0);
        this.updateStatCard('active-jobs', stats.active_jobs || 0);

        // Mettre à jour les graphiques
        this.renderUserStats();
        this.renderApplicationStats();
        this.renderJobStats();
    }

    updateStatCard(cardId, value) {
        const card = document.getElementById(cardId);
        if (card) {
            const valueElement = card.querySelector('.stat-value');
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
    }

    renderUserStats() {
        const container = document.getElementById('user-stats-chart');
        if (!container) return;

        const totalUsers = this.statistics.total_users || 0;
        const admins = this.statistics.total_administrateurs || 0;
        const recruteurs = this.statistics.total_recruteurs || 0;
        const candidats = this.statistics.total_candidats || 0;

        container.innerHTML = `
            <div class="chart-container">
                <h4>Répartition des utilisateurs</h4>
                <div class="pie-chart">
                    <div class="chart-segment" style="--percentage: ${(admins/totalUsers)*100}%; --color: #dc3545;">
                        <span>Admins: ${admins}</span>
                    </div>
                    <div class="chart-segment" style="--percentage: ${(recruteurs/totalUsers)*100}%; --color: #28a745;">
                        <span>Recruteurs: ${recruteurs}</span>
                    </div>
                    <div class="chart-segment" style="--percentage: ${(candidats/totalUsers)*100}%; --color: #007bff;">
                        <span>Candidats: ${candidats}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderApplicationStats() {
        const container = document.getElementById('application-stats-chart');
        if (!container) return;

        const totalApps = this.statistics.total_applications || 0;
        const pending = this.statistics.pending_applications || 0;
        const interviews = this.statistics.interviews_scheduled || 0;

        container.innerHTML = `
            <div class="chart-container">
                <h4>Statut des candidatures</h4>
                <div class="bar-chart">
                    <div class="bar-item">
                        <label>En attente</label>
                        <div class="bar">
                            <div class="bar-fill" style="width: ${(pending/totalApps)*100}%; background: #ffc107;"></div>
                        </div>
                        <span>${pending}</span>
                    </div>
                    <div class="bar-item">
                        <label>Entretiens</label>
                        <div class="bar">
                            <div class="bar-fill" style="width: ${(interviews/totalApps)*100}%; background: #17a2b8;"></div>
                        </div>
                        <span>${interviews}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderJobStats() {
        const container = document.getElementById('job-stats-chart');
        if (!container) return;

        const totalJobs = this.statistics.total_jobs || 0;
        const activeJobs = this.statistics.active_jobs || 0;
        const inactiveJobs = totalJobs - activeJobs;

        container.innerHTML = `
            <div class="chart-container">
                <h4>Statut des offres</h4>
                <div class="progress-bars">
                    <div class="progress-item">
                        <label>Actives: ${activeJobs}</label>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(activeJobs/totalJobs)*100}%;"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <label>Inactives: ${inactiveJobs}</label>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(inactiveJobs/totalJobs)*100}%; background: #6c757d;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderUsers() {
        const container = document.getElementById('users-table');
        if (!container) return;

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.nom} ${user.prenom || ''}</td>
                <td>${user.telephone || '-'}</td>
                <td>
                    <span class="role-badge role-${user.role}">${this.getRoleLabel(user.role)}</span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-role-btn" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderJobs() {
        const container = document.getElementById('jobs-table');
        if (!container) return;

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.jobs.map(job => `
            <tr>
                <td>${job.id}</td>
                <td>${job.titre}</td>
                <td>${job.entreprise}</td>
                <td>${job.location}</td>
                <td>
                    <span class="status-badge status-${job.status}">${job.status}</span>
                </td>
                <td>${new Date(job.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-info view-job-btn" data-job-id="${job.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning edit-job-btn" data-job-id="${job.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderApplications() {
        const container = document.getElementById('applications-table');
        if (!container) return;

        const tbody = container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = this.applications.map(app => `
            <tr>
                <td>${app.id}</td>
                <td>${app.job_titre}</td>
                <td>${app.entreprise}</td>
                <td>${app.candidat_nom}</td>
                <td>${app.candidat_email}</td>
                <td>
                    <span class="status-badge status-${app.statut}">${app.statut}</span>
                </td>
                <td>${new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-info view-application-btn" data-application-id="${app.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary update-status-btn" data-application-id="${app.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getRoleLabel(role) {
        const labels = {
            'administrateur': 'Admin',
            'recruteur': 'Recruteur',
            'candidat': 'Candidat'
        };
        return labels[role] || role;
    }

    showSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            await api.deleteUser(userId);
            window.showNotification('Utilisateur supprimé avec succès', 'success');
            await this.loadUsers();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            window.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    openRoleModal(userId) {
        const modal = document.getElementById('role-modal');
        if (!modal) return;

        const user = this.users.find(u => u.id == userId);
        if (!user) return;

        // Remplir le formulaire
        const roleSelect = document.getElementById('new-role');
        const userIdInput = document.getElementById('user-id');
        
        if (roleSelect) roleSelect.value = user.role;
        if (userIdInput) userIdInput.value = userId;

        // Afficher le modal
        modal.style.display = 'block';

        // Gérer la fermeture
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }

        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }

    async updateUserRole() {
        const userId = document.getElementById('user-id')?.value;
        const newRole = document.getElementById('new-role')?.value;

        if (!userId || !newRole) {
            window.showNotification('Données manquantes', 'error');
            return;
        }

        try {
            await api.updateUserRole(userId, newRole);
            window.showNotification('Rôle mis à jour avec succès', 'success');
            
            // Fermer le modal
            document.getElementById('role-modal').style.display = 'none';
            
            // Recharger les utilisateurs
            await this.loadUsers();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du rôle:', error);
            window.showNotification('Erreur lors de la mise à jour du rôle', 'error');
        }
    }

    exportData() {
        const data = {
            statistics: this.statistics,
            users: this.users,
            jobs: this.jobs,
            applications: this.applications,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `recrutdncs-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.showNotification('Données exportées avec succès', 'success');
    }
}

// Initialiser le dashboard administrateur
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-dashboard')) {
        new AdminDashboard();
    }
});
