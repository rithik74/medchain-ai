exports.validateVitals = (req, res, next) => {
  const { patient_id, heart_rate, spo2, temperature } = req.body;
  const errors = [];
  if (!patient_id) errors.push('patient_id is required');
  if (heart_rate === undefined || heart_rate < 0 || heart_rate > 300) errors.push('heart_rate must be between 0 and 300');
  if (spo2 === undefined || spo2 < 0 || spo2 > 100) errors.push('spo2 must be between 0 and 100');
  if (temperature === undefined || temperature < 25 || temperature > 45) errors.push('temperature must be between 25 and 45');
  if (req.body.blood_pressure_systolic !== undefined) {
    if (req.body.blood_pressure_systolic < 40 || req.body.blood_pressure_systolic > 300) errors.push('blood_pressure_systolic must be between 40 and 300');
  }
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};

exports.validatePatient = (req, res, next) => {
  const { patient_id, name } = req.body;
  const errors = [];
  if (!patient_id) errors.push('patient_id is required');
  if (!name) errors.push('name is required');
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};
