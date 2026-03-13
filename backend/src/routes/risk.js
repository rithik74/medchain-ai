const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { validateVitals } = require('../middleware/validation');

router.post('/analyze', validateVitals, riskController.analyzeRisk);
router.get('/logs/:patientId', riskController.getRiskLogs);

module.exports = router;
