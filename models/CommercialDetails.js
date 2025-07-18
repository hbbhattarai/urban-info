const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommercialDetails = sequelize.define('CommercialDetails', {
  unitId: { type: DataTypes.INTEGER, allowNull: false },
  businessType: { type: DataTypes.STRING },
  licenseNumber: { type: DataTypes.STRING },
  employeeCount: { type: DataTypes.INTEGER },
  shopPhotos: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = CommercialDetails;
