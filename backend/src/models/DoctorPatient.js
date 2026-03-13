const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorPatient = sequelize.define('DoctorPatient', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  patient_id: { type: DataTypes.STRING, allowNull: false },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'doctor_patients',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['doctor_id', 'patient_id'] },
  ],
});

module.exports = DoctorPatient;
