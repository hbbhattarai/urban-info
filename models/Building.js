const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Building = sequelize.define('Building', {
  plotId: { type: DataTypes.INTEGER, allowNull: false },
  identifier: { type: DataTypes.STRING },
  ownerCid: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING },
  yearBuilt: { type: DataTypes.INTEGER },
  storeys: { type: DataTypes.INTEGER },
  structureType: { type: DataTypes.STRING },
  retrofitReady: { type: DataTypes.BOOLEAN },
  facadePhotos: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = Building;
