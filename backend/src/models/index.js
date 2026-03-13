const sequelize = require('../config/database');
const Patient = require('./Patient');
const Vitals = require('./Vitals');
const RiskLog = require('./RiskLog');
const User = require('./User');
const ChatMessage = require('./ChatMessage');
const Emergency = require('./Emergency');
const DoctorPatient = require('./DoctorPatient');

const Appointment = require('./Appointment');

Patient.hasMany(Vitals, { foreignKey: 'patient_id', sourceKey: 'patient_id' });
Vitals.belongsTo(Patient, { foreignKey: 'patient_id', targetKey: 'patient_id' });
Patient.hasMany(RiskLog, { foreignKey: 'patient_id', sourceKey: 'patient_id' });
RiskLog.belongsTo(Patient, { foreignKey: 'patient_id', targetKey: 'patient_id' });
Patient.hasMany(Emergency, { foreignKey: 'patient_id', sourceKey: 'patient_id' });
Emergency.belongsTo(Patient, { foreignKey: 'patient_id', targetKey: 'patient_id' });

// Appointments
Patient.hasMany(Appointment, { foreignKey: 'patient_id', sourceKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', targetKey: 'patient_id' });
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'Doctor' });

// Doctor-Patient many-to-many
User.hasMany(DoctorPatient, { foreignKey: 'doctor_id', as: 'assignments' });
DoctorPatient.belongsTo(User, { foreignKey: 'doctor_id', as: 'Doctor' });
DoctorPatient.belongsTo(Patient, { foreignKey: 'patient_id', targetKey: 'patient_id', as: 'Patient' });
Patient.hasMany(DoctorPatient, { foreignKey: 'patient_id', sourceKey: 'patient_id', as: 'doctorAssignments' });

module.exports = { sequelize, Patient, Vitals, RiskLog, User, ChatMessage, Emergency, DoctorPatient, Appointment };
