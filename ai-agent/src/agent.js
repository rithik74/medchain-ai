const RiskAnalysisChain = require('./chains/riskAnalysisChain');
const { calculateRisk } = require('./tools/riskCalculator');

let chain = null, chainInitFailed = false;

async function initChain() {
  if (chain) return chain;
  if (chainInitFailed) return null;
  try {
    chain = new RiskAnalysisChain();
    await chain.init();
    console.log('✅ AI Risk Analysis Chain initialized');
    return chain;
  } catch (err) {
    console.warn('⚠️  AI Chain init failed:', err.message);
    chainInitFailed = true;
    return null;
  }
}

async function analyzeVitals(vitalsData) {
  const riskChain = await initChain();
  if (riskChain) {
    try { return await riskChain.analyze(vitalsData); }
    catch (err) { console.error('AI analysis failed, falling back to rules:', err.message); }
  }

  const calc = calculateRisk(vitalsData);
  const reasons = {
    LOW: 'All vital signs within normal limits. Patient appears stable.',
    MEDIUM: `Borderline vital signs detected (${calc.flags.join(', ')}). Close monitoring required.`,
    HIGH: `Significantly abnormal vital signs (${calc.flags.join(', ')}). Urgent medical attention needed.`,
    CRITICAL: `Critical vital sign values detected (${calc.flags.join(', ')}). Immediate emergency response required.`,
  };
  const actions = {
    LOW: 'Continue routine monitoring as scheduled.',
    MEDIUM: 'Increase monitoring frequency to every 30 minutes. Alert nurse on duty.',
    HIGH: 'Notify medical staff immediately. Prepare for potential intervention.',
    CRITICAL: 'IMMEDIATE emergency response required. Prepare oxygen support, alert emergency team, continuous monitoring.',
  };
  return {
    risk_level: calc.riskLevel,
    reason: reasons[calc.riskLevel],
    recommended_action: actions[calc.riskLevel],
    alert_required: calc.riskLevel !== 'LOW',
    vitals_flagged: calc.flags,
  };
}

module.exports = { analyzeVitals };
