const express = require('express');
const JobController = require('../controllers/jobController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.post('/', auth, authorize('recruteur', 'administrateur'), validate(schemas.createJob), JobController.createJob);
router.put('/:id', auth, authorize('recruteur', 'administrateur'), validate(schemas.updateJob), JobController.updateJob);
router.delete('/:id', auth, authorize('recruteur', 'administrateur'), JobController.deleteJob);
router.get('/my/jobs', auth, authorize('recruteur', 'administrateur'), JobController.getMyJobs);

module.exports = router;
