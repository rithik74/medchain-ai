const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emergency = sequelize.define('Emergency', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.STRING, allowNull: false },
  triggered_by: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'resolved'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  resolved_by: { type: DataTypes.STRING, allowNull: true },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'emergencies',
  timestamps: false,
});

module.exports = Emergency;
