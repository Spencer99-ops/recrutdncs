// API pour le dashboard candidat
class ProfileCandidatAPI {
    constructor() {
        this.api = new API();
    }
    
    async getDashboardStats() {
        return this.api.get('/api/profile/stats');
    }
    
    async getMyApplications() {
        return this.api.get('/api/applications/my');
    }
    
    async getRecommendedJobs() {
        return this.api.get('/api/jobs/recommended');
    }
    
    async getProfile() {
        return this.api.get('/api/profile/me');
    }
    
    async updateProfile(data) {
        return this.api.put('/api/profile/me', data);
    }
}

const profileCandidatAPI = new ProfileCandidatAPI();