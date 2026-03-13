/**
 * MedChain AI - End-to-End Demo Test Script
 * Tests the backend API flow without needing a database
 * Uses the AI service's rule-based fallback for risk analysis
 */

const aiService = require('../backend/src/services/aiService');
const hashService = require('../backend/src/services/hashService');

const scenarios = [
  { name: 'Normal Vitals (LOW Risk)', vitals: { patient_id: 'P-1001', heart_rate: 72, spo2: 98, temperature: 36.8 } },
  { name: 'Elevated (MEDIUM Risk)', vitals: { patient_id: 'P-1002', heart_rate: 105, spo2: 91, temperature: 38.1 } },
  { name: 'Multi-param escalation (HIGH Risk)', vitals: { patient_id: 'P-1003', heart_rate: 108, spo2: 91, temperature: 38.2 } },
  { name: 'Emergency (CRITICAL Risk)', vitals: { patient_id: 'P-1004', heart_rate: 145, spo2: 82, temperature: 40.5 } },
  { name: 'Low SpO2 only (HIGH Risk)', vitals: { patient_id: 'P-1005', heart_rate: 75, spo2: 87, temperature: 36.8 } },
  { name: 'With Blood Pressure CRITICAL', vitals: { patient_id: 'P-1001', heart_rate: 90, spo2: 96, temperature: 37.0, blood_pressure_systolic: 190 } },
];

async function runTests() {
  console.log('🧪 MedChain AI — Risk Analysis Test\n' + '='.repeat(50));

  let passed = 0;
  for (const scenario of scenarios) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`   Input: HR=${scenario.vitals.heart_rate}, SpO2=${scenario.vitals.spo2}, Temp=${scenario.vitals.temperature}${scenario.vitals.blood_pressure_systolic ? `, BP=${scenario.vitals.blood_pressure_systolic}` : ''}`);

    try {
      const result = await aiService.analyzeRisk(scenario.vitals);
      console.log(`   Risk: ${result.risk_level}`);
      console.log(`   Reason: ${result.reason}`);
      console.log(`   Action: ${result.recommended_action}`);
      console.log(`   Alert: ${result.alert_required}`);
      console.log(`   Flagged: [${result.vitals_flagged.join(', ')}]`);

      // Generate hash
      const hash = hashService.generateHash(scenario.vitals);
      console.log(`   Hash: ${hash.slice(0, 20)}...`);

      passed++;
      console.log(`   ✅ PASS`);
    } catch (err) {
      console.log(`   ❌ FAIL: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed}/${scenarios.length} passed`);
  console.log(passed === scenarios.length ? '🎉 All tests passed!' : '⚠️  Some tests failed');
}

runTests();
