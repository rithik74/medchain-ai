const router = require('express').Router();
const { DoctorPatient, User, Patient } = require('../models');
const { protect } = require('../middleware/authMiddleware');

// Get my assigned doctors (for patients)
router.get('/my-doctors', protect, async (req, res, next) => {
  try {
    const assignments = await DoctorPatient.findAll({
      where: { patient_id: req.user.patient_id },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'email', 'role'] }],
    });
    res.json({ success: true, data: assignments.map(a => a.Doctor) });
  } catch (error) { next(error); }
});

// Get my assigned patients (for doctors)
router.get('/my-patients', protect, async (req, res, next) => {
  try {
    const assignments = await DoctorPatient.findAll({
      where: { doctor_id: req.user.id },
      include: [{ model: Patient, as: 'Patient' }],
    });
    res.json({ success: true, data: assignments.map(a => a.Patient) });
  } catch (error) { next(error); }
});

// Get available doctors (for patient to pick from)
router.get('/available-doctors', protect, async (req, res, next) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'name', 'email'],
    });
    // Mark which ones are already assigned to this patient
    const assigned = await DoctorPatient.findAll({
      where: { patient_id: req.user.patient_id },
      attributes: ['doctor_id'],
      raw: true,
    });
    const assignedIds = new Set(assigned.map(a => a.doctor_id));
    const result = doctors.map(d => ({
      ...d.toJSON(),
      isAssigned: assignedIds.has(d.id),
    }));
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// Assign a doctor to patient
router.post('/assign', protect, async (req, res, next) => {
  try {
    const { doctor_id } = req.body;
    const patient_id = req.user.patient_id;
    if (!patient_id) return res.status(400).json({ success: false, message: 'Only patients can assign doctors' });

    const existing = await DoctorPatient.findOne({ where: { doctor_id, patient_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Doctor already assigned' });

    const assignment = await DoctorPatient.create({ doctor_id, patient_id });

    // Notify doctor via Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${doctor_id}`).emit('patient-assigned', {
        patient_id,
        message: `Patient ${req.user.name} has been assigned to you`,
      });
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error) { next(error); }
});

// Remove a doctor assignment
router.delete('/unassign/:doctorId', protect, async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const patient_id = req.user.patient_id;
    await DoctorPatient.destroy({ where: { doctor_id: doctorId, patient_id } });
    res.json({ success: true, message: 'Doctor removed' });
  } catch (error) { next(error); }
});

module.exports = router;
