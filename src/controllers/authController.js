const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validate } = require('../middleware/validation');
const { schemas } = require('../middleware/validation');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, nom, telephone, role = 'candidat' } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
      }

      const userId = await User.create({ email, password, nom, telephone, role });
      const user = await User.findById(userId);

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'Inscription réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          telephone: user.telephone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }

      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          telephone: user.telephone,
          role: user.role,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          telephone: user.telephone,
          role: user.role,
          bio: user.bio,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Erreur profil:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const updatedUser = await User.update(req.user.id, req.body);

      res.json({
        message: 'Profil mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil.' });
    }
  }
}

module.exports = AuthController;
