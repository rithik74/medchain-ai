const { RiskLog } = require('../models');
const aiService = require('../services/aiService');
const alertService = require('../services/alertService');

exports.analyzeRisk = async (req, res, next) => {
  try {
    const vitalsData = req.body;
    const riskAssessment = await aiService.analyzeRisk(vitalsData);

    const riskLog = await RiskLog.create({
      patient_id: vitalsData.patient_id,
      risk_level: riskAssessment.risk_level,
      reason: riskAssessment.reason,
      recommended_action: riskAssessment.recommended_action,
      alert_required: riskAssessment.alert_required,
      vitals_flagged: riskAssessment.vitals_flagged,
      timestamp: new Date(),
    });

    if (riskAssessment.alert_required) {
      try {
        await alertService.sendAlert({ patient_id: vitalsData.patient_id, vitals: vitalsData, riskAssessment });
      } catch (emailError) {
        console.error('Email alert failed:', emailError.message);
      }

      // Emit real-time notification via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('risk-alert', {
          patient_id: vitalsData.patient_id,
          risk_level: riskAssessment.risk_level,
          reason: riskAssessment.reason,
          timestamp: new Date(),
        });
      }
    }

    res.json({ success: true, data: { ...riskAssessment, log_id: riskLog.id } });
  } catch (error) { next(error); }
};

exports.getRiskLogs = async (req, res, next) => {
  try {
    const logs = await RiskLog.findAll({
      where: { patient_id: req.params.patientId },
      order: [['timestamp', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, data: logs });
  } catch (error) { next(error); }
};
