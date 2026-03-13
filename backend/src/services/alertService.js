const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;
try {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
} catch (err) { console.warn('⚠️  Email transporter not configured:', err.message); }

exports.sendAlert = async function ({ patient_id, vitals, riskAssessment }) {
  if (!transporter || !env.SMTP_USER) {
    console.warn('⚠️  Email alert skipped — SMTP not configured');
    return;
  }

  // Build recipient list — doctor + patient email
  const recipients = [];
  if (env.ALERT_EMAIL) recipients.push(env.ALERT_EMAIL);

  // Fetch patient's email from database
  try {
    const { Patient } = require('../models');
    const patient = await Patient.findOne({ where: { patient_id } });
    if (patient?.email && !recipients.includes(patient.email)) {
      recipients.push(patient.email);
    }
  } catch (err) {
    console.warn('Could not fetch patient email:', err.message);
  }

  if (recipients.length === 0) {
    console.warn('⚠️  No recipients for email alert');
    return;
  }

  const colors = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };
  const color = colors[riskAssessment.risk_level] || '#6b7280';

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px;border-radius:12px 12px 0 0">
        <h1 style="color:#f8fafc;margin:0;font-size:20px">🏥 MedChain AI Alert</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0">
        <div style="background:${color};color:white;padding:12px 20px;border-radius:8px;text-align:center;font-size:18px;font-weight:bold;margin-bottom:16px">
          ⚠️ ${riskAssessment.risk_level} RISK — Patient ${patient_id}
        </div>
        <h3 style="color:#334155;margin-top:16px">Vital Signs</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Heart Rate</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${vitals.heart_rate} bpm</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">SpO2</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${vitals.spo2}%</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Temperature</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${vitals.temperature}°C</td></tr>
          ${vitals.blood_pressure_systolic ? `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Blood Pressure</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic||'—'} mmHg</td></tr>` : ''}
        </table>
        <h3 style="color:#334155;margin-top:16px">Assessment</h3>
        <p style="color:#475569">${riskAssessment.reason}</p>
        <h3 style="color:#334155">Recommended Action</h3>
        <p style="color:${color};font-weight:bold">${riskAssessment.recommended_action}</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:20px">Flagged: ${riskAssessment.vitals_flagged.join(', ')||'None'}</p>
      </div>
      <div style="background:#1e293b;padding:16px;border-radius:0 0 12px 12px;text-align:center">
        <p style="color:#94a3b8;margin:0;font-size:12px">MedChain AI — AI-Powered Healthcare Monitoring</p>
      </div>
    </div>`;

  try {
    const info = await transporter.sendMail({
      from: `"MedChain AI Alert" <${env.SMTP_USER}>`,
      to: recipients.join(', '),
      subject: `[${riskAssessment.risk_level}] Patient Alert — ${patient_id}`,
      html,
    });
    console.log(`📧 Alert email sent to ${recipients.join(', ')}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Failed to send email alert:', err.message);
  }
};

