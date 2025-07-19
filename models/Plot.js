const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plot = sequelize.define('Plot', {
  parcelId: { type: DataTypes.INTEGER, allowNull: false },
  isConstructed: { type: DataTypes.BOOLEAN },
  photos:  { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = Plot;
