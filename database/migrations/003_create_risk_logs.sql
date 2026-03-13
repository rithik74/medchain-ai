CREATE TABLE IF NOT EXISTS risk_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reason TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  alert_required BOOLEAN DEFAULT FALSE,
  vitals_flagged JSONB DEFAULT '[]',
  record_hash VARCHAR(66),
  tx_hash VARCHAR(66),
  timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risk_logs_patient ON risk_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_risk_logs_level ON risk_logs(risk_level);
