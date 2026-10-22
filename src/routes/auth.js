const express = require('express');
const AuthController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validate(schemas.register), AuthController.register);
router.post('/login', validate(schemas.login), AuthController.login);
router.get('/profile/me', auth, AuthController.getProfile);
router.put('/profile/me', auth, validate(schemas.updateProfile), AuthController.updateProfile);

module.exports = router;
