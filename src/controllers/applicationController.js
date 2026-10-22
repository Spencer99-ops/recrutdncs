const Application = require('../models/Application');
const Job = require('../models/Job');

class ApplicationController {
  static async applyToJob(req, res) {
    try {
      const { jobId } = req.params;
      
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Offre non trouvée.' });
      }

      const hasAlreadyApplied = await Application.hasAlreadyApplied(jobId, req.user.id);
      if (hasAlreadyApplied) {
        return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Le CV est requis.' });
      }

      const applicationData = {
        job_id: jobId,
        user_id: req.user.id,
        cv_path: req.file.filename,
        lettre_motivation: req.body.lettre_motivation || ''
      };

      const applicationId = await Application.create(applicationData);
      const application = await Application.findById(applicationId);

      res.status(201).json({
        message: 'Candidature soumise avec succès',
        application
      });
    } catch (error) {
      console.error('Erreur candidature:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la soumission de la candidature.' });
    }
  }

  static async getMyApplications(req, res) {
    try {
      let applications;

      if (req.user.role === 'candidat') {
        applications = await Application.findByUserId(req.user.id);
      } else if (req.user.role === 'recruteur') {
        applications = await Application.findByRecruiterId(req.user.id);
      } else if (req.user.role === 'administrateur') {
        applications = await Application.findAll();
      }

      res.json({
        applications,
        count: applications.length
      });
    } catch (error) {
      console.error('Erreur récupération candidatures:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body;

      if (!['en_attente', 'entretien', 'refuse'].includes(statut)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }

      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ error: 'Candidature non trouvée.' });
      }

      const job = await Job.findById(application.job_id);
      if (req.user.role !== 'administrateur' && job.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette candidature.' });
      }

      const updatedApplication = await Application.updateStatus(
        id, 
        statut, 
        req.user.role === 'administrateur' ? null : req.user.id
      );

      res.json({
        message: 'Statut de la candidature mis à jour avec succès',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Erreur mise à jour statut candidature:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut.' });
    }
  }

  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await Application.findById(id);

      if (!application) {
        return res.status(404).json({ error: 'Candidature non trouvée.' });
      }

      if (req.user.role === 'candidat' && application.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à voir cette candidature.' });
      }

      if (req.user.role === 'recruteur') {
        const job = await Job.findById(application.job_id);
        if (job.user_id !== req.user.id) {
          return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à voir cette candidature.' });
        }
      }

      res.json({ application });
    } catch (error) {
      console.error('Erreur récupération candidature:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
}

module.exports = ApplicationController;
