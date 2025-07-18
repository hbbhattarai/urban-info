const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Park = sequelize.define('Park', {
  parcelId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING },
  area: { type: DataTypes.FLOAT },
  facilities: { type: DataTypes.TEXT },
  photo: { type: DataTypes.STRING },
});

// Remove associate here; define all associations in index.js

module.exports = Park;
