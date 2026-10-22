const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Route de test simple
router.get('/test', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Route de test fonctionne',
            user: req.user
        });
    } catch (error) {
        console.error('Erreur route test:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;
