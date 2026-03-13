const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vitals = sequelize.define('Vitals', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.STRING, allowNull: false },
  heart_rate: { type: DataTypes.FLOAT, allowNull: false },
  spo2: { type: DataTypes.FLOAT, allowNull: false },
  temperature: { type: DataTypes.FLOAT, allowNull: false },
  blood_pressure_systolic: { type: DataTypes.FLOAT, allowNull: true },
  blood_pressure_diastolic: { type: DataTypes.FLOAT, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'vitals',
  timestamps: false,
});

module.exports = Vitals;
