const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API RECRUTDNCS - Système de Gestion des Recrutements',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      admin: '/api/admin'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

app.use((error, req, res, next) => {
  console.error('Erreur détaillée:', error);
  console.error('Stack trace:', error.stack);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Le fichier est trop volumineux.' });
  }
  
  if (error.message === 'Seuls les fichiers PDF sont autorisés') {
    return res.status(400).json({ error: error.message });
  }
  
  // Pour le développement, renvoyer le message d'erreur détaillé
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({ 
      error: error.message || 'Erreur serveur interne.',
      stack: error.stack 
    });
  }
  
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur RECRUTDNCS démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
});

module.exports = app;
