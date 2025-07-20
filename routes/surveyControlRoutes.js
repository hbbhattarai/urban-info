// surveyRoutes.js (with Google Drive image upload integration for all routes)

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFileToDrive } = require('../utils/googleDriveUploader');

const Parcel = require('../models/Parcel');
const Plot = require('../models/Plot');
const Park = require('../models/Park');
const Street = require('../models/Street');
const Building = require('../models/Building');
const Unit = require('../models/Unit');
const Shapefile = require('../models/Shapefile');
const surveyShapefileController = require('../controllers/surveyShapefileController');

const storage = multer.memoryStorage();

const upload = multer({ storage });

async function uploadFilesToDrive(files) {
  const links = [];
  for (const file of files) {
    const uploaded = await uploadFileToDrive(file);
    links.push(uploaded.webContentLink);
    fs.unlinkSync(file.path);
  }
  return links;
}


// GET Routes

router.get('/get-data/:surveyId', surveyShapefileController.getData);
router.get('/view/:surveyId', surveyShapefileController.renderSurveyData);

router.get('/:surveyId/survey/parcel/:featureId', async (req, res) => {
  const { surveyId, featureId } = req.params;
  const parcel = await Parcel.findOne({ where: { featureId } });
  if (parcel) return res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/${parcel.type}`);
  res.render('surveyor/parcelTypeSelection', { surveyId, featureId });
});

// Park Routes

router.get('/:surveyId/survey/parcel/:parcelId/park', (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;
  res.render('surveyor/parkDetails', { parcelId, surveyId });
});

// Street Routes

router.get('/:surveyId/survey/parcel/:parcelId/street', (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;

  res.render('surveyor/streetDetails', { parcelId, surveyId });
});

// Plot Routes

router.get('/:surveyId/survey/parcel/:parcelId/plot', async (req, res) => {
  const { parcelId, surveyId } = req.params;

  try {
    const plot = await Plot.findOne({ where: { parcelId } });

    if (plot) {
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/building/${plot.id}`);
    } else {
      res.render('surveyor/plotDetails', { parcelId, surveyId, plot });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Building Routes

router.get('/:surveyId/survey/parcel/:parcelId/building/:plotId', async (req, res) => {
  const { surveyId, parcelId, plotId } = req.params;

  try {
    const building = await Building.findAll({ where: { plotId } });
    const editBuilding = null;
    res.render('surveyor/buildingDetails', { surveyId, parcelId, plotId, building, editBuilding });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/edit', async (req, res) => {
  const { surveyId, parcelId, buildingId, plotId } = req.params;

  try {
    const building = await Building.findAll({ where: { id: plotId } });
    const editBuilding = await Building.findOne({ where: { id: buildingId } });
    res.render('surveyor/buildingDetails', { surveyId, parcelId, plotId, building, editBuilding });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/// Units Routes 

router.get(
  '/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/units',
  async (req, res) => {
    const { surveyId, parcelId, plotId, buildingId } = req.params;

    try {
      const units = await Unit.findAll({ where: { buildingId } });
      const editUnit = null;

      res.render('surveyor/unitDetails', {
        surveyId,
        parcelId,
        plotId,
        buildingId,
        units,
        editUnit
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);


router.get(
  '/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/unit/:unitId/edit',
  async (req, res) => {
    const { surveyId, parcelId, plotId, buildingId, unitId } = req.params;

    try {
      const units = await Unit.findAll({ where: { buildingId } });
      const editUnit = await Unit.findOne({ where: { id: unitId } });

      res.render('surveyor/unitDetails', {
        surveyId,
        parcelId,
        plotId,
        buildingId,
        units,
        editUnit
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

router.get('/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/unit/:unitId/view', async (req, res) => {
  const { surveyId, parcelId, plotId, buildingId, unitId } = req.params;

  try {
    const unit = await Unit.findOne({ where: { id: unitId } });

    res.render('surveyor/unitView', {
      surveyId,
      parcelId,
      plotId,
      buildingId,
      unit
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// POST Routes 

router.post('/:surveyId/survey/parcel/:featureId', async (req, res) => {
  const { surveyId, featureId } = req.params;
  const { type } = req.body;
  let parcel = await Parcel.findOne({ where: { featureId } });
  if (!parcel) parcel = await Parcel.create({ featureId, type });
  res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/${type}`);
});

router.post('/:surveyId/survey/parcel/:parcelId/park', upload.array('parkPhotos', 10), async (req, res) => {
  const { surveyId, parcelId } = req.params;
  const { status, name, areaSize, parkType } = req.body;
  try {
    const photoLinks = await uploadFilesToDrive(req.files || []);
    const parcel = await Parcel.findByPk(parcelId);
    const shapefile = await Shapefile.findByPk(parcel.featureId);
    if (shapefile) { shapefile.status = status; await shapefile.save(); }
    let park = await Park.findOne({ where: { parcelId } });
    if (park) {
      Object.assign(park, { name, areaSize, parkType });
      if (photoLinks.length) park.photos = photoLinks.join(',');
      await park.save();
    } else {
      await Park.create({ parcelId, name, areaSize, parkType, photos: photoLinks.join(',') });
    }
    res.redirect(`/editor/surveys/view/${surveyId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving park');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/street', upload.array('photos', 10), async (req, res) => {
  const { parcelId, surveyId } = req.params;
  const { status, streetType, materialUsed, paved, notes } = req.body;
  try {
    const photoLinks = await uploadFilesToDrive(req.files || []);
    const parcel = await Parcel.findByPk(parcelId);
    const shapefile = await Shapefile.findByPk(parcel.featureId);
    if (shapefile) { shapefile.status = status; await shapefile.save(); }
    let street = await Street.findOne({ where: { parcelId } });
    if (street) {
      Object.assign(street, { streetType, materialUsed, paved: paved === 'on', notes });
      if (photoLinks.length) street.photos = photoLinks.join(',');
      await street.save();
    } else {
      await Street.create({ parcelId, streetType, materialUsed, paved: paved === 'on', notes, photos: photoLinks.join(',') });
    }
    res.redirect(`/editor/surveys/view/${surveyId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving street');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/plot', upload.array('facadePhotos', 10), async (req, res) => {
  const { parcelId, surveyId } = req.params;
  const { status, isConstructed } = req.body;
  try {
    const photoLinks = await uploadFilesToDrive(req.files || []);
    const parcel = await Parcel.findByPk(parcelId);
    const shapefile = await Shapefile.findByPk(parcel.featureId);
    if (shapefile) { shapefile.status = status === 'on'; await shapefile.save(); }
    let plot = await Plot.findOne({ where: { parcelId } });
    if (plot) {
      Object.assign(plot, { isConstructed: isConstructed === 'on', status: status === 'on' });
      if (photoLinks.length) plot.photos = photoLinks.join(',');
      await plot.save();
    } else {
      plot = await Plot.create({ parcelId, isConstructed: isConstructed === 'on', status: status === 'on', photos: photoLinks.join(',') });
    }
    if (isConstructed === 'on') {
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/building/${plot.id}`);
    } else {
      res.redirect(`/editor/surveys/view/${surveyId}`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving plot');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/building/:plotId/add', upload.array('facadePhotos', 10), async (req, res) => {
  const { surveyId, parcelId, plotId } = req.params;
  const { name, ownerCid, yearBuilt, storeys, structureType, retrofitReady } = req.body;
  try {
    const photoLinks = await uploadFilesToDrive(req.files || []);
    await Building.create({ plotId, name, ownerCid, yearBuilt, storeys, structureType, retrofitReady: retrofitReady === 'on', facadePhotos: photoLinks.join(',') });
    res.redirect(`/editor/surveys/view/${surveyId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving building');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/edit', upload.array('facadePhotos', 10), async (req, res) => {
  const { surveyId, parcelId, plotId, buildingId } = req.params;
  const { name, ownerCid, yearBuilt, storeys, structureType, retrofitReady } = req.body;
  try {
    const photoLinks = await uploadFilesToDrive(req.files || []);
    const building = await Building.findByPk(buildingId);
    if (!building) return res.status(404).send('Building not found');
    Object.assign(building, { name, ownerCid, yearBuilt, storeys, structureType, retrofitReady: retrofitReady === 'on' });
    if (photoLinks.length) building.facadePhotos = photoLinks.join(',');
    await building.save();
    res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/building/${plotId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating building');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/unit/save', upload.fields([
  { name: 'interiorPhotos', maxCount: 10 },
  { name: 'signboardPhotos', maxCount: 10 }
]), async (req, res) => {
  const { surveyId, parcelId, plotId, buildingId } = req.params;
  const data = req.body;
  try {
    const interiorLinks = await uploadFilesToDrive(req.files['interiorPhotos'] || []);
    const signboardLinks = await uploadFilesToDrive(req.files['signboardPhotos'] || []);

    const unitData = {
      buildingId,
      useType: data.useType,
      floor: data.floor,
      area: data.area,
      usage: data.usage,
      rent: data.rent,
      tenantName: data.tenantName,
      tenantOrigin: data.tenantOrigin,
      tenancyYears: data.tenancyYears,
      roomsCount: data.roomsCount,
      familySize: data.familySize,
      malePopulation: data.malePopulation,
      femalePopulation: data.femalePopulation,
      bedrooms: ['Residential', 'Both'].includes(data.useType) ? data.bedrooms : null,
      bathrooms: ['Residential', 'Both'].includes(data.useType) ? data.bathrooms : null,
      businessName: ['Commercial', 'Both'].includes(data.useType) ? data.businessName : null,
      licenseNumber: ['Commercial', 'Both'].includes(data.useType) ? data.licenseNumber : null,
      interiorPhotos: interiorLinks.join(','),
      signboardPhotos: signboardLinks.join(',')
    };

    if (data.unitId) {
      const unit = await Unit.findByPk(data.unitId);
      if (!unit) return res.status(404).send('Unit not found');
      Object.assign(unit, unitData);
      await unit.save();
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/plot/${plotId}/building/${buildingId}/unit/${unit.id}/view`);
    } else {
      await Unit.create(unitData);
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/plot/${plotId}/building/${buildingId}/units`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving unit');
  }
});

module.exports = router;