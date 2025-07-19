
const { Sequelize } = require('sequelize');
require('dotenv').config();

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // If using SSL (e.g., on Heroku), you might need this:
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;


module.exports = sequelize;
