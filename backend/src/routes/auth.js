const router = require('express').Router();
const { register, login, getMe, setup2FA, verify2FA, login2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/login-2fa', login2FA);
router.get('/me', protect, getMe);

router.get('/setup-2fa', protect, setup2FA);
router.post('/verify-2fa', protect, verify2FA);

module.exports = router;
