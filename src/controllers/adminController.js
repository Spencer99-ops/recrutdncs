const User = require('../models/User');

class AdminController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      
      res.json({
        users,
        count: users.length
      });
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      await User.delete(id);

      res.json({
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'utilisateur.' });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const { query } = require('../config/database');

      const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
      const [totalJobs] = await query('SELECT COUNT(*) as count FROM jobs');
      const [totalApplications] = await query('SELECT COUNT(*) as count FROM applications');
      
      const [usersByRole] = await query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);

      const [applicationsByStatus] = await query(`
        SELECT statut, COUNT(*) as count 
        FROM applications 
        GROUP BY statut
      `);

      res.json({
        stats: {
          totalUsers: totalUsers[0].count,
          totalJobs: totalJobs[0].count,
          totalApplications: totalApplications[0].count,
          usersByRole,
          applicationsByStatus
        }
      });
    } catch (error) {
      console.error('Erreur dashboard:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
}

module.exports = AdminController;
