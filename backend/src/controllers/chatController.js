const { ChatMessage, User, DoctorPatient, Patient } = require('../models');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.id;
    const type = req.user.role;

    const msg = await ChatMessage.create({ sender_id, receiver_id, message, type });

    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiver_id}`).emit('new-message', msg);
    }

    res.status(201).json({ success: true, data: msg });
  } catch (error) { next(error); }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: contactId },
          { sender_id: contactId, receiver_id: userId },
        ],
      },
      order: [['timestamp', 'ASC']],
      limit: 100,
    });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
};

exports.getContacts = async (req, res, next) => {
  try {
    let contacts = [];

    if (req.user.role === 'doctor') {
      // Doctor sees only their assigned patients
      const assignments = await DoctorPatient.findAll({
        where: { doctor_id: req.user.id },
        attributes: ['patient_id'],
        raw: true,
      });
      const patientIds = assignments.map(a => a.patient_id);
      if (patientIds.length > 0) {
        contacts = await User.findAll({
          where: { patient_id: { [Op.in]: patientIds } },
          attributes: ['id', 'name', 'email', 'role', 'patient_id'],
        });
      }
    } else if (req.user.role === 'patient') {
      // Patient sees only their assigned doctors
      const assignments = await DoctorPatient.findAll({
        where: { patient_id: req.user.patient_id },
        attributes: ['doctor_id'],
        raw: true,
      });
      const doctorIds = assignments.map(a => a.doctor_id);
      if (doctorIds.length > 0) {
        contacts = await User.findAll({
          where: { id: { [Op.in]: doctorIds } },
          attributes: ['id', 'name', 'email', 'role', 'patient_id'],
        });
      }
    }

    res.json({ success: true, data: contacts });
  } catch (error) { next(error); }
};

