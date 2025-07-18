const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  buildingId: { type: DataTypes.INTEGER, allowNull: false },
  useType: { type: DataTypes.ENUM('Commercial', 'Residential') },
  rent: { type: DataTypes.DECIMAL },
  tenantName: { type: DataTypes.STRING },
  tenantOrigin: { type: DataTypes.STRING },
  tenancyYears: { type: DataTypes.DECIMAL },
  roomsCount: { type: DataTypes.INTEGER },
  interiorPhotos: { type: DataTypes.ARRAY(DataTypes.STRING) },
  signboardPhotos: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = Unit;
