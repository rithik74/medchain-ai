const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  patient_id: { type: DataTypes.STRING, allowNull: false },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  date_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'cancelled', 'completed'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  meeting_link: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Appointment;
