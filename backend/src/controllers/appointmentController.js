const { Appointment, User, Patient } = require('../models');

// Patient requests an appointment
exports.requestAppointment = async (req, res, next) => {
  try {
    const { doctor_id, date_time, notes } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user.patient_id) {
       return res.status(400).json({ success: false, message: 'Only registered patients can book appointments.' });
    }

    const appointment = await Appointment.create({
      patient_id: user.patient_id,
      doctor_id,
      date_time,
      notes,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

// Doctor approves an appointment
exports.approveAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    // Generate a unique meeting string
    const meeting_link = `medchain-${appointment.id}`;
    
    appointment.status = 'approved';
    appointment.meeting_link = meeting_link;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

// Doctor or Patient cancels appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) { next(err); }
};

// Fetch appointments for a user
exports.getAppointments = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    let appointments;

    if (user.role === 'doctor') {
      appointments = await Appointment.findAll({
        where: { doctor_id: user.id },
        include: [{ model: Patient }],
        order: [['date_time', 'ASC']]
      });
    } else {
      appointments = await Appointment.findAll({
        where: { patient_id: user.patient_id },
        include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }],
        order: [['date_time', 'ASC']]
      });
    }

    res.json({ success: true, data: appointments });
  } catch (err) { next(err); }
};
