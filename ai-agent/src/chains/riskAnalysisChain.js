const { createLLM } = require('../config/llm');
const { getSystemMessage, createVitalsMessage } = require('../prompts/healthcarePrompt');

class RiskAnalysisChain {
  constructor() { this.llm = null; this.systemMessage = getSystemMessage(); }

  async init() { if (!this.llm) this.llm = createLLM(); }

  parseResponse(responseText) {
    let text = responseText.trim();
    if (text.startsWith('```json')) text = text.slice(7);
    else if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    const parsed = JSON.parse(text);
    if (!parsed.risk_level || !parsed.reason || !parsed.recommended_action) throw new Error('Missing required fields');
    parsed.risk_level = parsed.risk_level.toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.risk_level)) throw new Error(`Invalid risk_level: ${parsed.risk_level}`);
    parsed.alert_required = parsed.alert_required ?? (parsed.risk_level !== 'LOW');
    parsed.vitals_flagged = parsed.vitals_flagged ?? [];
    return parsed;
  }

  async analyze(vitalsData, maxRetries = 2) {
    await this.init();
    const humanMessage = createVitalsMessage(vitalsData);
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.llm.invoke([this.systemMessage, humanMessage]);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        return this.parseResponse(content);
      } catch (err) {
        lastError = err;
        console.warn(`LLM attempt ${attempt + 1} failed:`, err.message);
        if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw lastError;
  }
}

module.exports = RiskAnalysisChain;
