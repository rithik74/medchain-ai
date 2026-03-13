const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');

// POST /api/alerts/send — Send an email alert for a patient's risk assessment
router.post('/send', async (req, res, next) => {
  try {
    const { patient_id, vitals, riskAssessment } = req.body;

    if (!patient_id || !vitals || !riskAssessment) {
      return res.status(400).json({ success: false, message: 'Missing required fields: patient_id, vitals, riskAssessment' });
    }

    const result = await alertService.sendAlert({ patient_id, vitals, riskAssessment });

    if (!result) {
      return res.status(503).json({ success: false, message: 'Email not configured. Update SMTP_USER, SMTP_PASS, and ALERT_EMAIL in .env' });
    }

    res.json({ success: true, message: 'Alert email sent successfully', messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: `Email failed: ${error.message}` });
  }
});

module.exports = router;
