const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { Patient } = require('../models');

function signToken(id) {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    let patient_id = null;
    if (role === 'patient') {
      const count = await Patient.count();
      patient_id = `P-${1001 + count}`;
      await Patient.create({ patient_id, name, email });
    }

    const user = await User.create({ name, email, password, role: role || 'patient', patient_id });
    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, patient_id: user.patient_id, token },
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, patient_id: user.patient_id, token },
    });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
