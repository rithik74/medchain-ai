const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sender_id: { type: DataTypes.STRING, allowNull: false },
  receiver_id: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('user', 'ai', 'doctor', 'patient'), defaultValue: 'user' },
  context: { type: DataTypes.JSON, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'chat_messages',
  timestamps: false,
});

module.exports = ChatMessage;
