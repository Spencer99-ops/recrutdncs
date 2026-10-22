const Job = require('../models/Job');
const Application = require('../models/Application');

class JobController {
  static async getAllJobs(req, res) {
    try {
      const { ville, type_contrat, titre } = req.query;
      const filters = {};
      
      if (ville) filters.ville = ville;
      if (type_contrat) filters.type_contrat = type_contrat;
      if (titre) filters.titre = titre;

      const jobs = await Job.findAll(filters);
      
      res.json({
        jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Erreur récupération offres:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);

      if (!job) {
        return res.status(404).json({ error: 'Offre non trouvée.' });
      }

      res.json({ job });
    } catch (error) {
      console.error('Erreur récupération offre:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async createJob(req, res) {
    try {
      const jobData = {
        ...req.body,
        user_id: req.user.id
      };

      const jobId = await Job.create(jobData);
      const job = await Job.findById(jobId);

      res.status(201).json({
        message: 'Offre créée avec succès',
        job
      });
    } catch (error) {
      console.error('Erreur création offre:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la création de l\'offre.' });
    }
  }

  static async updateJob(req, res) {
    try {
      const { id } = req.params;
      
      const existingJob = await Job.findById(id);
      if (!existingJob) {
        return res.status(404).json({ error: 'Offre non trouvée.' });
      }

      if (req.user.role !== 'administrateur' && existingJob.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette offre.' });
      }

      const updatedJob = await Job.update(id, req.body, req.user.role === 'administrateur' ? null : req.user.id);

      res.json({
        message: 'Offre mise à jour avec succès',
        job: updatedJob
      });
    } catch (error) {
      console.error('Erreur mise à jour offre:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'offre.' });
    }
  }

  static async deleteJob(req, res) {
    try {
      const { id } = req.params;
      
      const existingJob = await Job.findById(id);
      if (!existingJob) {
        return res.status(404).json({ error: 'Offre non trouvée.' });
      }

      if (req.user.role !== 'administrateur' && existingJob.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette offre.' });
      }

      await Job.delete(id, req.user.role === 'administrateur' ? null : req.user.id);

      res.json({
        message: 'Offre supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression offre:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'offre.' });
    }
  }

  static async getMyJobs(req, res) {
    try {
      const jobs = await Job.findByUserId(req.user.id);
      
      res.json({
        jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Erreur récupération mes offres:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
}

module.exports = JobController;
