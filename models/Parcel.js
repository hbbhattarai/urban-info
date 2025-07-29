const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parcel = sequelize.define('Parcel', {
  featureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'This is the ID from the clicked GeoJSON feature',
  },
  type: {
    type: DataTypes.ENUM('park', 'plot', 'street'),
    allowNull: false,
  }
});

// Define associations later in index.js

module.exports = Parcel;
