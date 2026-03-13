const path = require('path');

let analyzeVitals;
try {
  const agentPath = path.resolve(__dirname, '../../../ai-agent/src/agent');
  analyzeVitals = require(agentPath).analyzeVitals;
  console.log('✅ AI Agent module loaded successfully');
} catch (err) {
  console.warn('⚠️  AI Agent module not available, using rule-based fallback');
  analyzeVitals = null;
}

function ruleBasedAnalysis(vitals) {
  const flags = [];
  let maxRisk = 'LOW';
  const rl = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  let mediumCount = 0, highCount = 0;

  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 85) { maxRisk = 'CRITICAL'; flags.push('spo2'); }
    else if (vitals.spo2 <= 89) { if (rl[maxRisk] < 2) maxRisk = 'HIGH'; highCount++; flags.push('spo2'); }
    else if (vitals.spo2 <= 92) { if (rl[maxRisk] < 1) maxRisk = 'MEDIUM'; mediumCount++; flags.push('spo2'); }
  }
  if (vitals.heart_rate !== undefined) {
    if (vitals.heart_rate > 130 || vitals.heart_rate < 40) { maxRisk = 'CRITICAL'; flags.push('heart_rate'); }
    else if (vitals.heart_rate > 110 || vitals.heart_rate < 51) { if (rl[maxRisk] < 2) maxRisk = 'HIGH'; highCount++; flags.push('heart_rate'); }
    else if (vitals.heart_rate > 100 || vitals.heart_rate < 56) { if (rl[maxRisk] < 1) maxRisk = 'MEDIUM'; mediumCount++; flags.push('heart_rate'); }
  }
  if (vitals.temperature !== undefined) {
    if (vitals.temperature > 40 || vitals.temperature < 35) { maxRisk = 'CRITICAL'; flags.push('temperature'); }
    else if (vitals.temperature >= 38.5 || vitals.temperature <= 35.5) { if (rl[maxRisk] < 2) maxRisk = 'HIGH'; highCount++; flags.push('temperature'); }
    else if (vitals.temperature >= 37.8 || vitals.temperature <= 36) { if (rl[maxRisk] < 1) maxRisk = 'MEDIUM'; mediumCount++; flags.push('temperature'); }
  }
  if (vitals.blood_pressure_systolic !== undefined) {
    const bp = vitals.blood_pressure_systolic;
    if (bp > 180 || bp < 90) { maxRisk = 'CRITICAL'; flags.push('blood_pressure'); }
    else if (bp >= 160 || bp <= 100) { if (rl[maxRisk] < 2) maxRisk = 'HIGH'; highCount++; flags.push('blood_pressure'); }
    else if (bp >= 140 || bp <= 110) { if (rl[maxRisk] < 1) maxRisk = 'MEDIUM'; mediumCount++; flags.push('blood_pressure'); }
  }

  if (mediumCount >= 2 && rl[maxRisk] < 2) maxRisk = 'HIGH';
  if (highCount >= 1 && mediumCount >= 1 && rl[maxRisk] < 3) maxRisk = 'CRITICAL';

  const reasons = {
    LOW: 'All vital signs within normal limits. Patient appears stable.',
    MEDIUM: `Borderline vital signs detected (${flags.join(', ')}). Close monitoring required.`,
    HIGH: `Significantly abnormal vital signs (${flags.join(', ')}). Urgent medical attention needed.`,
    CRITICAL: `Critical vital sign values detected (${flags.join(', ')}). Immediate emergency response required.`,
  };
  const actions = {
    LOW: 'Continue routine monitoring as scheduled.',
    MEDIUM: 'Increase monitoring frequency to every 30 minutes. Alert nurse on duty.',
    HIGH: 'Notify medical staff immediately. Prepare for potential intervention.',
    CRITICAL: 'IMMEDIATE emergency response required. Prepare oxygen support, alert emergency team, continuous monitoring.',
  };

  return {
    risk_level: maxRisk,
    reason: reasons[maxRisk],
    recommended_action: actions[maxRisk],
    alert_required: maxRisk !== 'LOW',
    vitals_flagged: [...new Set(flags)],
  };
}

exports.analyzeRisk = async function (vitalsData) {
  if (analyzeVitals) {
    try { return await analyzeVitals(vitalsData); }
    catch (err) { console.error('AI Agent error, using fallback:', err.message); }
  }
  return ruleBasedAnalysis(vitalsData);
};
