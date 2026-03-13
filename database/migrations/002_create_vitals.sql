CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
  heart_rate FLOAT NOT NULL,
  spo2 FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  blood_pressure_systolic FLOAT,
  blood_pressure_diastolic FLOAT,
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
