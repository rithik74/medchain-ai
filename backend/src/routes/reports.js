const router = require('express').Router();
const { generateReport } = require('../controllers/reportController');

router.get('/:patientId', generateReport);

module.exports = router;
