const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User');
const Survey = require('./Survey');
const Shapefile = require('./Shapefile');
const Building = require('./Building');
const CommercialDetails = require('./CommercialDetails');
const Parcel = require('./Parcel');
const Park = require('./Park');
const Plot = require('./Plot');
const ResidentialDetails = require('./ResidentialDetails');
const Street = require('./Street');
const Unit = require('./Unit');

const models = {
  User,
  Survey,
  Shapefile,
  Building,
  CommercialDetails,
  Parcel,
  Park,
  Plot,
  ResidentialDetails,
  Street,
  Unit,
};

// Define associations here - **both directions**

Parcel.hasOne(Park, { foreignKey: 'parcelId' });
Park.belongsTo(Parcel, { foreignKey: 'parcelId' });

Parcel.hasOne(Plot, { foreignKey: 'parcelId' });
Plot.belongsTo(Parcel, { foreignKey: 'parcelId' });

Parcel.hasOne(Street, { foreignKey: 'parcelId' });
Street.belongsTo(Parcel, { foreignKey: 'parcelId' });

Building.belongsTo(Plot, { foreignKey: 'plotId' });
Plot.hasMany(Building, { foreignKey: 'plotId' });

Unit.belongsTo(Building, { foreignKey: 'buildingId' });
Building.hasMany(Unit, { foreignKey: 'buildingId' });

CommercialDetails.belongsTo(Unit, { foreignKey: 'unitId' });
Unit.hasOne(CommercialDetails, { foreignKey: 'unitId' });

ResidentialDetails.belongsTo(Unit, { foreignKey: 'unitId' });
Unit.hasOne(ResidentialDetails, { foreignKey: 'unitId' });

Shapefile.belongsTo(Survey, { foreignKey: 'survey_id' });
Survey.hasMany(Shapefile, { foreignKey: 'survey_id' });

// Export sequelize and models for use
module.exports = {
  sequelize,
  DataTypes,
  ...models,
};
