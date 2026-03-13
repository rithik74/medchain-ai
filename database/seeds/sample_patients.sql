INSERT INTO patients (patient_id, name, email, age, medical_history) VALUES
  ('P-1001', 'John Doe', 'john.doe@example.com', 45, 'Hypertension'),
  ('P-1002', 'Jane Smith', 'jane.smith@example.com', 32, 'None'),
  ('P-1003', 'Bob Wilson', 'bob.wilson@example.com', 67, 'Diabetes Type 2, COPD'),
  ('P-1004', 'Alice Chen', 'alice.chen@example.com', 28, 'Asthma'),
  ('P-1005', 'Carlos Rivera', 'carlos.rivera@example.com', 55, 'Heart disease')
ON CONFLICT (patient_id) DO NOTHING;
