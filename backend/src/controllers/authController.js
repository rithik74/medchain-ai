const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
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

    if (user.two_factor_enabled) {
      const tempToken = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '5m' });
      return res.json({
        success: true,
        data: { require2FA: true, tempToken }
      });
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

exports.setup2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const secret = speakeasy.generateSecret({ name: `MedChain AI (${user.email})` });
    
    user.two_factor_secret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) throw err;
      res.json({ success: true, data: { qr_code: data_url, secret: secret.base32 } });
    });
  } catch (error) { next(error); }
};

exports.verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.two_factor_enabled = true;
      await user.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) { next(error); }
};

exports.login2FA = async (req, res, next) => {
  try {
    const { tempToken, totpToken } = req.body;
    if (!tempToken || !totpToken) return res.status(400).json({ success: false, message: 'Missing tokens' });

    let decoded;
    try {
      decoded = jwt.verify(tempToken, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired temporary token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: totpToken
    });

    if (verified) {
      const token = signToken(user.id);
      res.json({
        success: true,
        data: { id: user.id, name: user.name, email: user.email, role: user.role, patient_id: user.patient_id, token },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }
  } catch (error) { next(error); }
};
