const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResidentialDetails = sequelize.define('ResidentialDetails', {
  unitId: { type: DataTypes.INTEGER, allowNull: false },
  familySize: { type: DataTypes.INTEGER },
  hasPets: { type: DataTypes.BOOLEAN },
  electricityConnection: { type: DataTypes.BOOLEAN },
  waterConnection: { type: DataTypes.BOOLEAN },
});

module.exports = ResidentialDetails;
