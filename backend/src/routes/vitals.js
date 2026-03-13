const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const { validateVitals } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', validateVitals, vitalsController.createVitals);
router.get('/:patientId', vitalsController.getVitalsByPatient);
router.delete('/:id', protect, authorize('doctor'), vitalsController.deleteVitals);

module.exports = router;

