const router = require('express').Router();
const { getDashboardStats } = require('../controllers/analyticsController');

router.get('/dashboard', getDashboardStats);

module.exports = router;
