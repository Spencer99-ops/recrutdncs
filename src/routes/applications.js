const express = require('express');
const ApplicationController = require('../controllers/applicationController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadCV } = require('../middleware/upload');

const router = express.Router();

router.post('/apply/:jobId', auth, authorize('candidat'), uploadCV, validate(schemas.applyJob), ApplicationController.applyToJob);
router.get('/', auth, ApplicationController.getMyApplications);
router.get('/:id', auth, ApplicationController.getApplicationById);
router.patch('/:id/status', auth, authorize('recruteur', 'administrateur'), ApplicationController.updateApplicationStatus);

module.exports = router;
