
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  // If using SSL (e.g., on Heroku), you might need this:
  dialectOptions: {
  },
});


module.exports = sequelize;
