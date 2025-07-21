const shapefile = require('shapefile');
const ShapefileModel = require('../models/Shapefile');
const fs = require('fs');
const proj4 = require('proj4');
const Survey = require('../models/Survey');


exports.showUploadForm = async (req, res) => {
  const surveyId = req.params.surveyId;
  const survey = await Survey.findByPk(surveyId);

  if (!survey) return res.status(404).send('Survey not found');

  res.render('surveys/upload-shapefile', { survey });
};

exports.getData = async (req, res) => {
  try {
    const shapefiles = await ShapefileModel.findAll({
      where: { survey_id: req.params.surveyId },
    });


    const geojson = {
      type: 'FeatureCollection',
      features: shapefiles.map(record => ({
        type: 'Feature',
        properties: { id: record.id, status: record.status, },
        geometry: record.geometry,

      }))
    };
    res.json(geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load GeoJSON' });
  }
}

exports.viewSurveyData = async (req, res) => {
  const surveyId = req.params.surveyId;
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return res.status(404).send('Survey not found');
    res.render('surveys/survey-view', {
      survey
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching survey data');
  }
};

exports.renderSurveyData = async (req, res) => {
  const surveyId = req.params.surveyId;
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return res.status(404).send('Survey not found');
    res.render('surveyor/survey-dashboard', {
      survey
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching survey data');
  }
};

exports.uploadShapefile = async (req, res) => {
  const surveyId = req.params.surveyId;
  if (!req.files || !req.files['shp'] || !req.files['dbf'] || !req.files['prj']) {
    return res.status(400).send('Missing required shapefile parts (.shp, .dbf, .prj)');
  }

  const shpPath = req.files['shp'][0].path;
  const dbfPath = req.files['dbf'][0].path;
  const prjPath = req.files['prj'][0].path;

  try {
    // Delete old features for this survey
    await ShapefileModel.destroy({ where: { survey_id: surveyId } });

    // Read and define source projection
    const prjContent = fs.readFileSync(prjPath, 'utf8');
    const sourceProj = proj4(prjContent);
    const wgs84 = proj4('EPSG:4326');

    const source = await shapefile.open(shpPath, dbfPath);

    while (true) {
      const result = await source.read();
      if (result.done) break;

      const transformedGeometry = transformToWGS84(result.value.geometry, sourceProj, wgs84);
      const plotID = result.value.properties.PlotID
      const area = result.value.properties.Area;
      const CIDNo = result.value.properties.CIDNo;
      await ShapefileModel.create({
        survey_id: surveyId,
        geometry: transformedGeometry,
        plotID: plotID,
        area: area,
        CIDNo: CIDNo,
        status: false,
      });
    }
322162
    // Cleanup uploaded files
    fs.unlinkSync(shpPath);
    fs.unlinkSync(dbfPath);
    fs.unlinkSync(prjPath);

    res.redirect(`/admin/surveys`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error importing shapefile');
  }
};

function transformToWGS84(geometry, sourceProj, destProj) {
  if (!geometry || !geometry.type || !geometry.coordinates) return geometry;

  const transformCoord = (coord) => proj4(sourceProj, destProj, coord);

  const recurseCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      return transformCoord(coords);
    }
    return coords.map(recurseCoords);
  };

  return {
    type: geometry.type,
    coordinates: recurseCoords(geometry.coordinates),
  };
}
