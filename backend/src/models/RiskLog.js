const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiskLog = sequelize.define('RiskLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.STRING, allowNull: false },
  risk_level: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  recommended_action: { type: DataTypes.TEXT, allowNull: false },
  alert_required: { type: DataTypes.BOOLEAN, defaultValue: false },
  vitals_flagged: { type: DataTypes.JSON, defaultValue: [] },
  record_hash: { type: DataTypes.STRING, allowNull: true },
  tx_hash: { type: DataTypes.STRING, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'risk_logs',
  timestamps: false,
});

module.exports = RiskLog;
