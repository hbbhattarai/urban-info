const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plot = sequelize.define('Plot', {
  parcelId: { type: DataTypes.INTEGER, allowNull: false },
  isConstructed: { type: DataTypes.BOOLEAN },
  photo: { type: DataTypes.STRING },
});

module.exports = Plot;
