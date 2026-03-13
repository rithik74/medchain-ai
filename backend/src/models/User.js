const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('doctor', 'patient', 'admin'), defaultValue: 'patient' },
  patient_id: { type: DataTypes.STRING, allowNull: true },
  two_factor_secret: { type: DataTypes.STRING, allowNull: true },
  two_factor_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 10);
    },
  },
});

User.prototype.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = User;
