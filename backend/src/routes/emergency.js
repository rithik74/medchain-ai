const router = require('express').Router();
const { triggerSOS, resolveEmergency, getActiveEmergencies } = require('../controllers/emergencyController');

router.post('/sos', triggerSOS);
router.put('/:id/resolve', resolveEmergency);
router.get('/active', getActiveEmergencies);

module.exports = router;
