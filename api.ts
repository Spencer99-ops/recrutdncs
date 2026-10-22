import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Pool } from 'pg';
import { attachDatabasePool } from '@neon/functions';

// Create the pool once at module scope
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper function for queries
async function query(sql: string, params?: any[]) {
  const result = await pool.query(sql, params);
  return result.rows;
}

// Health check / API info
app.get('/api', (c) => {
  return c.json({
    message: 'RECRUTDNCS API - Système de Gestion des Recrutements',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      jobs: '/api/jobs',
      applications: '/api/applications',
      admin: '/api/admin',
      candidate: '/api/candidate'
    }
  });
});

// Jobs endpoints
app.get('/api/jobs', async (c) => {
  try {
    const jobs = await query(`
      SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `);
    return c.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

app.get('/api/jobs/:id', async (c) => {
  try {
    const jobId = c.req.param('id');
    const jobs = await query(`
      SELECT j.*, u.nom as recruteur_nom, u.email as recruteur_email, u.telephone as recruteur_telephone
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.id = $1 AND j.status = 'active'
    `, [jobId]);
    
    if (jobs.length === 0) {
      return c.json({ success: false, message: 'Offre non trouvée' }, 404);
    }
    
    return c.json({ success: true, data: jobs[0] });
  } catch (error) {
    console.error('Error fetching job:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

// Users endpoints
app.get('/api/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const users = await query(`
      SELECT id, nom, email, telephone, role, bio, location, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (users.length === 0) {
      return c.json({ success: false, message: 'Utilisateur non trouvé' }, 404);
    }
    
    const user = users[0];
    
    if (user.role === 'candidat') {
      const skills = await query(`
        SELECT skill_name FROM user_skills WHERE user_id = $1
      `, [userId]);
      user.skills = skills.map((s: any) => s.skill_name);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

// Profile endpoints
app.get('/api/profile/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const users = await query(`
      SELECT id, nom, email, telephone, role, bio, location, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (users.length === 0) {
      return c.json({ success: false, message: 'Utilisateur non trouvé' }, 404);
    }
    
    const user = users[0];
    
    if (user.role === 'candidat') {
      const skills = await query(`
        SELECT skill_name FROM user_skills WHERE user_id = $1
      `, [userId]);
      user.skills = skills.map((s: any) => s.skill_name);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

// Auth endpoint - verify token
app.post('/api/auth/verify', async (c) => {
  try {
    const jwt = require('jsonwebtoken');
    const authHeader = c.req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return c.json({ success: false, message: 'Token d\'authentification manquant' }, 401);
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const users = await query(`
      SELECT id, email, nom, telephone, role, bio, location, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [decoded.userId || decoded.id]);
    
    if (users.length === 0) {
      return c.json({ success: false, message: 'Utilisateur non trouvé' }, 401);
    }

    return c.json({ success: true, user: users[0] });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return c.json({ success: false, message: 'Token invalide' }, 403);
    } else if (error.name === 'TokenExpiredError') {
      return c.json({ success: false, message: 'Token expiré' }, 403);
    } else {
      console.error('Error verifying token:', error);
      return c.json({ success: false, message: 'Erreur d\'authentification' }, 500);
    }
  }
});

// Applications endpoint
app.get('/api/applications', async (c) => {
  try {
    const jwt = require('jsonwebtoken');
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Token d\'authentification manquant' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = decoded.role;
    const userId = decoded.id || decoded.userId;
    
    let applications;
    
    switch (userRole) {
      case 'candidat':
        applications = await query(`
          SELECT a.*, j.titre as job_titre, j.entreprise, j.location, j.type_contrat, j.salaire_min, j.salaire_max
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
          WHERE a.user_id = $1
          ORDER BY a.created_at DESC
        `, [userId]);
        break;
        
      case 'recruteur':
        applications = await query(`
          SELECT a.*, u.nom as candidat_nom, u.email as candidat_email, u.telephone as candidat_telephone,
                 j.titre as job_titre, j.entreprise
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN jobs j ON a.job_id = j.id
          WHERE j.user_id = $1
          ORDER BY a.created_at DESC
        `, [userId]);
        break;
        
      case 'administrateur':
        applications = await query(`
          SELECT a.*, u.nom as candidat_nom, u.email as candidat_email, u.role as candidat_role,
                 j.titre as job_titre, j.entreprise, r.nom as recruteur_nom
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN jobs j ON a.job_id = j.id
          LEFT JOIN users r ON j.user_id = r.id
          ORDER BY a.created_at DESC
        `);
        break;
        
      default:
        return c.json({ success: false, message: 'Rôle non autorisé' }, 403);
    }
    
    return c.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    const { email, password } = await c.req.json();
    
    const users = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (users.length === 0) {
      return c.json({ success: false, message: 'Email ou mot de passe incorrect' }, 401);
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return c.json({ success: false, message: 'Email ou mot de passe incorrect' }, 401);
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
      { expiresIn: '24h' }
    );
    
    return c.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ success: false, message: 'Erreur serveur' }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint non trouvé',
    path: c.req.path
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    message: 'Erreur serveur interne',
    error: err.message
  }, 500);
});

export default app;
