const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: false // Render internal connections don't use SSL
  } : {},
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
