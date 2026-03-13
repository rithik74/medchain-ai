const { Emergency, Patient, Vitals } = require('../models');
const alertService = require('../services/alertService');

exports.triggerSOS = async (req, res, next) => {
  try {
    const { patient_id, notes } = req.body;
    const triggered_by = req.user ? req.user.id : 'manual';

    const emergency = await Emergency.create({ patient_id, triggered_by, notes, status: 'active' });

    const latestVitals = await Vitals.findOne({ where: { patient_id }, order: [['timestamp', 'DESC']] });

    if (req.app.get('io')) {
      req.app.get('io').emit('emergency-sos', {
        emergency,
        patient_id,
        vitals: latestVitals,
        timestamp: new Date(),
      });
    }

    try {
      await alertService.sendAlert({
        patient_id,
        vitals: latestVitals || { heart_rate: 0, spo2: 0, temperature: 0 },
        riskAssessment: {
          risk_level: 'CRITICAL',
          reason: `🚨 EMERGENCY SOS triggered! ${notes || 'No additional notes.'}`,
          recommended_action: 'IMMEDIATE emergency response required. Contact patient immediately.',
          vitals_flagged: ['EMERGENCY_SOS'],
        },
      });
    } catch (emailErr) { console.error('SOS email failed:', emailErr.message); }

    res.status(201).json({ success: true, data: emergency });
  } catch (error) { next(error); }
};

exports.resolveEmergency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findByPk(id);
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    emergency.status = 'resolved';
    emergency.resolved_by = req.user ? req.user.id : 'unknown';
    emergency.resolved_at = new Date();
    await emergency.save();

    if (req.app.get('io')) {
      req.app.get('io').emit('emergency-resolved', { id, resolved_at: emergency.resolved_at });
    }

    res.json({ success: true, data: emergency });
  } catch (error) { next(error); }
};

exports.getActiveEmergencies = async (req, res, next) => {
  try {
    const emergencies = await Emergency.findAll({
      where: { status: 'active' },
      order: [['timestamp', 'DESC']],
      include: [{ model: Patient, attributes: ['name', 'email', 'age'] }],
    });
    res.json({ success: true, data: emergencies });
  } catch (error) { next(error); }
};
