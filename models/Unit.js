const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  buildingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  useType: {
    type: DataTypes.ENUM('Residential', 'Commercial', 'Both'),
    allowNull: false
  },
  floor: {
    type: DataTypes.STRING
  },

  area: {
    type: DataTypes.STRING
  },

  usage: {
    type: DataTypes.STRING
  },
  remarks: {
    type: DataTypes.STRING
  },
  rent: {
    type: DataTypes.DECIMAL
  },

  tenantName: {
    type: DataTypes.STRING
  },

  tenantOrigin: {
    type: DataTypes.STRING
  },

  tenancyYears: {
    type: DataTypes.DECIMAL
  },

  roomsCount: {
    type: DataTypes.INTEGER
  },

  familySize: {
    type: DataTypes.INTEGER
  },

  malePopulation: {
    type: DataTypes.INTEGER
  },

  femalePopulation: {
    type: DataTypes.INTEGER
  },

  bedrooms: {
    type: DataTypes.INTEGER
  },
  halls: {
    type: DataTypes.INTEGER
  },
  kitchens: {
    type: DataTypes.INTEGER
  },
  balcony: {
    type: DataTypes.INTEGER
  },
  bathrooms: {
    type: DataTypes.INTEGER
  },

  businessName: {
    type: DataTypes.STRING
  },

  licenseNumber: {
    type: DataTypes.STRING
  },

  interiorPhotos: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },

  signboardPhotos: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
});

module.exports = Unit;