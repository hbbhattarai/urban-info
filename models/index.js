const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User');
const Survey = require('./Survey');
const Shapefile = require('./Shapefile');
const Building = require('./Building');
const Parcel = require('./Parcel');
const Park = require('./Park');
const Plot = require('./Plot');
const Street = require('./Street');
const Unit = require('./Unit');

const models = {
  User,
  Survey,
  Shapefile,
  Building,
  Parcel,
  Park,
  Plot,
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

Shapefile.belongsTo(Survey, { foreignKey: 'survey_id' });
Survey.hasMany(Shapefile, { foreignKey: 'survey_id' });

// Export sequelize and models for use
module.exports = {
  sequelize,
  DataTypes,
  ...models,
};
