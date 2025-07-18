const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Street = sequelize.define('Street', {
  parcelId: { type: DataTypes.INTEGER, allowNull: false },
  streetType: { type: DataTypes.ENUM('footpath', 'road','parking') },
  materialUsed: { type: DataTypes.STRING },
  paved: { type: DataTypes.BOOLEAN },
  notes: { type: DataTypes.TEXT },
  photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = Street;
