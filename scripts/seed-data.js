/**
 * MedChain AI - Seed Data Script
 * Run from project root: node scripts/seed-data.js
 */
const path = require('path');

// Load .env from backend
require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../backend/.env'),
});

// Resolve backend modules
const modelsPath = path.resolve(__dirname, '../backend/src/models');
const { sequelize, Patient } = require(modelsPath);

const patients = [
  { patient_id: 'P-1001', name: 'John Doe', email: 'john.doe@example.com', age: 45, medical_history: 'Hypertension' },
  { patient_id: 'P-1002', name: 'Jane Smith', email: 'jane.smith@example.com', age: 32, medical_history: 'None' },
  { patient_id: 'P-1003', name: 'Bob Wilson', email: 'bob.wilson@example.com', age: 67, medical_history: 'Diabetes Type 2, COPD' },
  { patient_id: 'P-1004', name: 'Alice Chen', email: 'alice.chen@example.com', age: 28, medical_history: 'Asthma' },
  { patient_id: 'P-1005', name: 'Carlos Rivera', email: 'carlos.rivera@example.com', age: 55, medical_history: 'Heart disease' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected');

    for (const p of patients) {
      const [patient, created] = await Patient.findOrCreate({ where: { patient_id: p.patient_id }, defaults: p });
      console.log(`${created ? '✅ Created' : '⏭️  Exists'}: ${patient.name} (${patient.patient_id})`);
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
