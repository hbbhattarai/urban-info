const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Park = sequelize.define('Park', {
  parcelId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING },
  area: { type: DataTypes.FLOAT },
  facilities: { type: DataTypes.TEXT },
  photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
});
module.exports = Park;
