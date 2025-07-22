// models/Shapefile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Survey = require('./Survey');

const Shapefile = sequelize.define('Shapefile', {
  survey_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Survey, key: 'id' },
    onDelete: 'CASCADE', // optional, to delete shapefiles if survey deleted
  },
  geometry: {
    type: DataTypes.GEOMETRY('POLYGON'), // Adjust type based on your shapefile geometry
    allowNull: false,
  },
  area: {
    type: DataTypes.STRING,
  },
  plotID: {
    type: DataTypes.STRING,
  },
  CIDNo: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.BOOLEAN,
  },
  isProgress: {
    type: DataTypes.BOOLEAN,
  },
}, {
  tableName: 'Shapefiles',
  timestamps: true,
});

Shapefile.belongsTo(Survey, { foreignKey: 'survey_id' });

module.exports = Shapefile;