const router = require('express').Router();
const { requestAppointment, approveAppointment, cancelAppointment, getAppointments } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAppointments);
router.post('/request', protect, authorize('patient'), requestAppointment);
router.put('/:id/approve', protect, authorize('doctor'), approveAppointment);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
