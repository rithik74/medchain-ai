const { Vitals } = require('../models');

exports.createVitals = async (req, res, next) => {
  try {
    const { patient_id, heart_rate, spo2, temperature, blood_pressure_systolic, blood_pressure_diastolic } = req.body;
    const vitals = await Vitals.create({
      patient_id, heart_rate, spo2, temperature,
      blood_pressure_systolic: blood_pressure_systolic || null,
      blood_pressure_diastolic: blood_pressure_diastolic || null,
      timestamp: new Date(),
    });
    res.status(201).json({ success: true, data: vitals });
  } catch (error) { next(error); }
};

exports.getVitalsByPatient = async (req, res, next) => {
  try {
    const vitals = await Vitals.findAll({
      where: { patient_id: req.params.patientId },
      order: [['timestamp', 'DESC']],
      limit: 200,
    });
    res.json({ success: true, data: vitals });
  } catch (error) { next(error); }
};

// Only doctors can delete vitals
exports.deleteVitals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vitals = await Vitals.findByPk(id);
    if (!vitals) return res.status(404).json({ success: false, message: 'Vitals record not found' });
    await vitals.destroy();
    res.json({ success: true, message: 'Vitals record deleted' });
  } catch (error) { next(error); }
};

