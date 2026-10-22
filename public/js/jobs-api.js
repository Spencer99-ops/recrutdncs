// Integration de l'API pour la page jobs-list.html
// Remplace les données mock par des appels API réels

class JobsManager {
    constructor() {
        this.jobs = [];
        this.filters = {
            location: '',
            type_contrat: '',
            titre: '',
            entreprise: '',
            remote: ''
        };
        this.currentPage = 1;
        this.jobsPerPage = 6;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadJobs();
        this.renderJobs();
    }

    bindEvents() {
        // Filtres
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.filters.titre = e.target.value;
            this.currentPage = 1;
            this.filterAndRenderJobs();
        });

        document.getElementById('location-filter')?.addEventListener('change', (e) => {
            this.filters.location = e.target.value;
            this.currentPage = 1;
            this.filterAndRenderJobs();
        });

        document.getElementById('contract-filter')?.addEventListener('change', (e) => {
            this.filters.type_contrat = e.target.value;
            this.currentPage = 1;
            this.filterAndRenderJobs();
        });

        document.getElementById('remote-filter')?.addEventListener('change', (e) => {
            this.filters.remote = e.target.value;
            this.currentPage = 1;
            this.filterAndRenderJobs();
        });

        // Bouton de postulation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-btn')) {
                const jobId = e.target.dataset.jobId;
                this.openApplicationModal(jobId);
            }

            if (e.target.classList.contains('details-btn')) {
                const jobId = e.target.dataset.jobId;
                this.viewJobDetails(jobId);
            }

            if (e.target.classList.contains('save-btn')) {
                const jobId = e.target.dataset.jobId;
                this.toggleSaveJob(jobId);
            }
        });

        // Modal de candidature
        document.getElementById('apply-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitApplication();
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }

    async loadJobs() {
        try {
            this.jobs = await api.getJobs(this.filters);
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
            window.showNotification('Erreur lors du chargement des offres', 'error');
            this.jobs = [];
        }
    }

    async filterAndRenderJobs() {
        await this.loadJobs();
        this.renderJobs();
    }

    renderJobs() {
        const container = document.getElementById('jobs-grid');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        const paginatedJobs = this.jobs.slice(startIndex, endIndex);

        if (paginatedJobs.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Aucune offre trouvée</h3>
                    <p>Essayez de modifier vos filtres de recherche.</p>
                </div>
            `;
            this.renderPagination(0);
            return;
        }

        container.innerHTML = paginatedJobs.map(job => this.createJobCard(job)).join('');
        this.renderPagination(this.jobs.length);
    }

    createJobCard(job) {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const isSaved = savedJobs.includes(job.id);

        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <h3 class="job-title">${job.titre}</h3>
                    <button class="save-btn ${isSaved ? 'saved' : ''}" data-job-id="${job.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="job-company">
                    <h4>${job.entreprise}</h4>
                    <div class="job-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${job.location}</span>
                    </div>
                </div>
                <div class="job-meta">
                    <span class="job-type">${job.type_contrat}</span>
                    ${job.remote ? '<span class="job-remote"><i class="fas fa-home"></i> Remote</span>' : ''}
                    ${job.salaire_min && job.salaire_max ? 
                        `<span class="job-salary">${job.salaire_min}k - ${job.salaire_max}k $</span>` : 
                        job.salaire_min ? 
                        `<span class="job-salary">À partir de ${job.salaire_min}k $</span>` : ''
                    }
                </div>
                <div class="job-description">
                    <p>${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}</p>
                </div>
                <div class="job-footer">
                    <button class="details-btn" data-job-id="${job.id}">
                        <i class="fas fa-info-circle"></i>
                        Détails
                    </button>
                    <button class="apply-btn" data-job-id="${job.id}">
                        <i class="fas fa-paper-plane"></i>
                        Postuler
                    </button>
                </div>
            </div>
        `;
    }

    renderPagination(totalJobs) {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(totalJobs / this.jobsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';

        // Bouton précédent
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage || i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="page-dots">...</span>';
            }
        }

        // Bouton suivant
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderJobs();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async viewJobDetails(jobId) {
        try {
            const job = await api.getJobById(jobId);
            if (job) {
                this.showJobDetailsModal(job);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            window.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    showJobDetailsModal(job) {
        const modal = document.getElementById('job-details-modal');
        if (!modal) return;

        const requirements = job.requirements ? `
            <div class="job-section">
                <h4><i class="fas fa-list-check"></i> Prérequis</h4>
                <p>${job.requirements}</p>
            </div>
        ` : '';

        const benefits = job.benefits ? `
            <div class="job-section">
                <h4><i class="fas fa-gift"></i> Avantages</h4>
                <p>${job.benefits}</p>
            </div>
        ` : '';

        const salary = job.salaire_min && job.salaire_max ? 
            `<p><strong>Salaire:</strong> ${job.salaire_min}k - ${job.salaire_max}k $</p>` :
            job.salaire_min ? 
            `<p><strong>Salaire:</strong> À partir de ${job.salaire_min}k $</p>` : '';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${job.titre}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="job-section">
                        <h4><i class="fas fa-building"></i> Entreprise</h4>
                        <p>${job.entreprise}</p>
                    </div>
                    <div class="job-section">
                        <h4><i class="fas fa-map-marker-alt"></i> Localisation</h4>
                        <p>${job.location} ${job.remote ? '<span class="remote-badge"><i class="fas fa-home"></i> Remote</span>' : ''}</p>
                    </div>
                    <div class="job-section">
                        <h4><i class="fas fa-file-contract"></i> Type de contrat</h4>
                        <p>${job.type_contrat}</p>
                    </div>
                    ${salary ? `
                        <div class="job-section">
                            <h4><i class="fas fa-dollar-sign"></i> Rémunération</h4>
                            ${salary}
                        </div>
                    ` : ''}
                    <div class="job-section">
                        <h4><i class="fas fa-align-left"></i> Description</h4>
                        <p>${job.description}</p>
                    </div>
                    ${requirements}
                    ${benefits}
                </div>
                <div class="modal-footer">
                    <button class="apply-btn" data-job-id="${job.id}">
                        <i class="fas fa-paper-plane"></i>
                        Postuler
                    </button>
                    <button class="details-btn" data-job-id="${job.id}">
                        <i class="fas fa-info-circle"></i>
                        Détails
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Fermeture du modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    openApplicationModal(jobId) {
        if (!api.currentUser) {
            window.showNotification('Vous devez être connecté pour postuler', 'warning');
            return;
        }

        const modal = document.getElementById('application-modal');
        if (!modal) return;

        modal.style.display = 'block';
        modal.dataset.jobId = jobId;

        // Fermeture du modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async submitApplication() {
        const modal = document.getElementById('application-modal');
        const jobId = modal?.dataset.jobId;

        if (!jobId) return;

        const formData = new FormData(document.getElementById('apply-form'));
        
        try {
            const applicationData = {
                job_id: parseInt(jobId),
                message_motivation: formData.get('message') || '',
                cv_path: formData.get('cv')?.name || '',
                cover_letter_path: formData.get('cover_letter')?.name || ''
            };

            const application = await api.createApplication(applicationData);
            
            window.showNotification('Candidature envoyée avec succès!', 'success');
            modal.style.display = 'none';
            document.getElementById('apply-form').reset();
            
            // Recharger les jobs pour mettre à jour les statuts
            await this.loadJobs();
            this.renderJobs();
            
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            window.showNotification('Erreur lors de l\'envoi de la candidature', 'error');
        }
    }

    toggleSaveJob(jobId) {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const index = savedJobs.indexOf(jobId);

        if (index > -1) {
            savedJobs.splice(index, 1);
            window.showNotification('Offre retirée des favoris', 'info');
        } else {
            savedJobs.push(jobId);
            window.showNotification('Offre ajoutée aux favoris', 'success');
        }

        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        this.renderJobs();
    }
}

// Initialiser le gestionnaire quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('jobs-grid')) {
        new JobsManager();
    }
});
