const RISK_NAMES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function calculateRisk(vitals) {
  const flags = [];
  let maxRiskScore = 0, mediumCount = 0, highCount = 0;

  if (vitals.spo2 != null) {
    if (vitals.spo2 < 85) { maxRiskScore = Math.max(maxRiskScore, 3); flags.push('spo2'); }
    else if (vitals.spo2 <= 89) { maxRiskScore = Math.max(maxRiskScore, 2); highCount++; flags.push('spo2'); }
    else if (vitals.spo2 <= 92) { maxRiskScore = Math.max(maxRiskScore, 1); mediumCount++; flags.push('spo2'); }
  }
  if (vitals.heart_rate != null) {
    if (vitals.heart_rate > 130 || vitals.heart_rate < 40) { maxRiskScore = Math.max(maxRiskScore, 3); flags.push('heart_rate'); }
    else if (vitals.heart_rate > 110 || vitals.heart_rate < 51) { maxRiskScore = Math.max(maxRiskScore, 2); highCount++; flags.push('heart_rate'); }
    else if (vitals.heart_rate > 100 || vitals.heart_rate < 56) { maxRiskScore = Math.max(maxRiskScore, 1); mediumCount++; flags.push('heart_rate'); }
  }
  if (vitals.temperature != null) {
    if (vitals.temperature > 40 || vitals.temperature < 35) { maxRiskScore = Math.max(maxRiskScore, 3); flags.push('temperature'); }
    else if (vitals.temperature >= 38.5 || vitals.temperature <= 35.5) { maxRiskScore = Math.max(maxRiskScore, 2); highCount++; flags.push('temperature'); }
    else if (vitals.temperature >= 37.8 || vitals.temperature <= 36) { maxRiskScore = Math.max(maxRiskScore, 1); mediumCount++; flags.push('temperature'); }
  }
  if (vitals.blood_pressure_systolic != null) {
    const bp = vitals.blood_pressure_systolic;
    if (bp > 180 || bp < 90) { maxRiskScore = Math.max(maxRiskScore, 3); flags.push('blood_pressure'); }
    else if (bp >= 160 || bp <= 100) { maxRiskScore = Math.max(maxRiskScore, 2); highCount++; flags.push('blood_pressure'); }
    else if (bp >= 140 || bp <= 110) { maxRiskScore = Math.max(maxRiskScore, 1); mediumCount++; flags.push('blood_pressure'); }
  }

  if (mediumCount >= 2 && maxRiskScore < 2) maxRiskScore = 2;
  if (highCount >= 1 && mediumCount >= 1 && maxRiskScore < 3) maxRiskScore = 3;

  return { riskScore: maxRiskScore, riskLevel: RISK_NAMES[maxRiskScore], flags: [...new Set(flags)], mediumCount, highCount };
}

module.exports = { calculateRisk, RISK_NAMES };
