const { Patient, Vitals, RiskLog } = require('../models');

exports.createPatient = async (req, res, next) => {
  try {
    const { patient_id, name, email, age, medical_history } = req.body;
    const patient = await Patient.create({ patient_id, name, email, age, medical_history });
    res.status(201).json({ success: true, data: patient });
  } catch (error) { next(error); }
};

exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: patients });
  } catch (error) { next(error); }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { patient_id: req.params.id },
      include: [
        { model: Vitals, limit: 10, order: [['timestamp', 'DESC']] },
        { model: RiskLog, limit: 10, order: [['timestamp', 'DESC']] },
      ],
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) { next(error); }
};
