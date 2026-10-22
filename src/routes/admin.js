const express = require('express');
const AdminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth, authorize('administrateur'), AdminController.getAllUsers);
router.delete('/users/:id', auth, authorize('administrateur'), AdminController.deleteUser);
router.get('/dashboard/stats', auth, authorize('administrateur'), AdminController.getDashboardStats);

module.exports = router;
