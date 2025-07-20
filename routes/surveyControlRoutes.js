require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs/promises');
const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const Plot = require('../models/Plot');
const Building = require('../models/Building');
const Unit = require('../models/Unit');
const Park = require('../models/Park');
const Street = require('../models/Street');
const path = require('path');
const surveyShapefileController = require('../controllers/surveyShapefileController');
const multer = require('multer');
const Shapefile = require('../models/Shapefile');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// API to return shapefile data as GeoJSON
router.get('/get-data/:surveyId', surveyShapefileController.getData);

// View survey dashboard
router.get('/view/:surveyId', surveyShapefileController.renderSurveyData);

// Multer setup for uploads folder
const storage = multer.memoryStorage()
const upload = multer({ storage });


function streamUpload(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'survey_photos' }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

// Parcel type selection page
router.get('/:surveyId/survey/parcel/:featureId', async (req, res) => {
  const { featureId } = req.params;
  const { surveyId } = req.params;

  try {
    let parcel = await Parcel.findOne({ where: { featureId } });
    if (parcel) {
      if (parcel.type === 'park') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/park`);
      } else if (parcel.type === 'plot') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/plot`);
      } else if (parcel.type === 'street') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/street`);
      }
    } else {
      res.render('surveyor/parcelTypeSelection', { featureId, surveyId });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }


});


// Handle parcel type form submission
router.post('/:surveyId/survey/parcel/:featureId', async (req, res) => {
  const { featureId } = req.params;
  const { surveyId } = req.params;
  const { type } = req.body;


  try {
    let parcel = await Parcel.findOne({ where: { featureId } });
    if (parcel) {
      const parcelId = parcel.id;
      if (parcel.type === 'park') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/park`);
      } else if (parcel.type === 'plot') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/plot`);
      } else if (parcel.type === 'street') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/street`);
      }
    } else {
      await Parcel.create({ featureId, type });
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${featureId}`);

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Modfied One

// Park Routes

router.get('/:surveyId/survey/parcel/:parcelId/park', async (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;
  let park = await Park.findAll({ where: { parcelId: parcelId } });
  if (park.length > 0) {
    res.render('surveyor/parkDetails', { parcelId, surveyId, park });
  } else {
    let park = []
    res.render('surveyor/parkDetails', { parcelId, surveyId, park });
  }


});

router.post('/:surveyId/survey/parcel/:parcelId/park',
  upload.array('parkPhotos', 10), // multer middleware to accept up to 10 files
  async (req, res) => {
    const { parcelId, surveyId } = req.params;
    const { status, name, areaSize, facilities } = req.body;

    try {
      let park = await Park.findOne({ where: { parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });
      if (shapefile) {
        shapefile.status = status;
        await shapefile.save();
      }

      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            photoUrls.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      if (park) {
        park.name = name;
        park.areaSize = areaSize || null;
        park.facilities = facilities;
        if (photoUrls.length > 0) park.photos = photoUrls;
        await park.save();
      } else {
        await Park.create({
          parcelId,
          name,
          areaSize,
          facilities,
          photos: photoUrls
        });
      }

      res.redirect(`/editor/surveys/view/${surveyId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);


// Street Routes

router.get('/:surveyId/survey/parcel/:parcelId/street', async (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;

  let streets = await Street.findAll({ where: { parcelId: parcelId } });
  if (streets.length > 0) {
    res.render('surveyor/streetDetails', { parcelId, surveyId, streets });
  } else {
    let street = []
    res.render('surveyor/streetDetails', { parcelId, surveyId, streets });
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/street',
  upload.array('photos', 10),
  async (req, res) => {
    const { parcelId, surveyId } = req.params;
    const { status, streetType, materialUsed, paved, notes } = req.body;

    try {
      let street = await Street.findOne({ where: { parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });
      if (shapefile) {
        shapefile.status = status;
        await shapefile.save();
      }

      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            photoUrls.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      if (street) {
        street.streetType = streetType;
        street.materialUsed = materialUsed;
        street.paved = paved === 'on';
        street.notes = notes;
        if (photoUrls.length > 0) street.photos = photoUrls;
        await street.save();
      } else {
        await Street.create({
          parcelId,
          streetType,
          materialUsed,
          paved: paved === 'on',
          notes,
          photos: photoUrls
        });
      }

      res.redirect(`/editor/surveys/view/${surveyId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);



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

router.post('/:surveyId/survey/parcel/:parcelId/plot',
  upload.array('facadePhotos', 10),
  async (req, res) => {
    const { parcelId, surveyId } = req.params;
    const { status, isConstructed } = req.body;

    try {
      let plot = await Plot.findOne({ where: { parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });

      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            photoUrls.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      if (shapefile) {
        shapefile.status = status === 'on';
        await shapefile.save();
      }

      if (plot) {
        plot.isConstructed = isConstructed === 'on';
        if (photoUrls.length > 0) plot.photos = photoUrls;
        plot.status = status === 'on';
        await plot.save();
      } else {
        plot = await Plot.create({
          parcelId,
          isConstructed: isConstructed === 'on',
          photos: photoUrls,
          status: status === 'on'
        });
      }

      if (isConstructed === 'on') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/building/${plot.id}`);
      } else {
        res.redirect(`/editor/surveys/view/${surveyId}`);
      }

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);



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

router.post('/:surveyId/survey/parcel/:parcelId/building/:plotId/add',
  upload.array('facadePhotos', 10),
  async (req, res) => {
    const { surveyId, parcelId, plotId } = req.params;
    const {
      name,
      ownerCid,
      yearBuilt,
      storeys,
      structureType,
      retrofitReady
    } = req.body;

    try {
      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            photoUrls.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      await Building.create({
        plotId,
        name,
        ownerCid,
        yearBuilt,
        storeys,
        structureType,
        retrofitReady: retrofitReady === 'on',
        facadePhotos: photoUrls
      });

      res.redirect(`/editor/surveys/view/${surveyId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to add building');
    }
  }
);

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

router.post('/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/edit',
  upload.array('facadePhotos', 10),
  async (req, res) => {
    const { surveyId, parcelId, plotId, buildingId } = req.params;
    const {
      name,
      ownerCid,
      yearBuilt,
      storeys,
      structureType,
      retrofitReady
    } = req.body;

    try {
      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            photoUrls.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      const building = await Building.findByPk(buildingId);
      if (!building) return res.status(404).send('Building not found');

      Object.assign(building, {
        name,
        ownerCid,
        yearBuilt,
        storeys,
        structureType,
        retrofitReady: retrofitReady === 'on',
      });

      if (photoUrls.length > 0) {
        building.facadePhotos = photoUrls;
      }

      await building.save();
      res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/building/${plotId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to update building');
    }
  }
);
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

router.post(
  '/:surveyId/survey/parcel/:parcelId/plot/:plotId/building/:buildingId/unit/save',
  upload.fields([
    { name: 'interiorPhotos', maxCount: 10 },
    { name: 'signboardPhotos', maxCount: 10 }
  ]),
  async (req, res) => {
    const { surveyId, parcelId, plotId, buildingId } = req.params;
    const {
      unitId,
      useType,
      floor,
      area,
      usage,
      rent,
      tenantName,
      tenantOrigin,
      tenancyYears,
      roomsCount,
      familySize,
      malePopulation,
      femalePopulation,
      bedrooms,
      bathrooms,
      businessName,
      licenseNumber
    } = req.body;

    try {
      const interiorPhotos = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            interiorPhotos.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      const signboardPhotos = [];
       if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await streamUpload(file.buffer);
            signboardPhotos.push(result.secure_url);
          } catch (err) {
            console.error('Cloudinary upload error:', err);
          }
        }
      }

      const unitData = {
        buildingId,
        useType,
        floor,
        area,
        usage,
        rent,
        tenantName,
        tenantOrigin,
        tenancyYears,
        roomsCount,
        familySize,
        malePopulation,
        femalePopulation,
        bedrooms: (useType === 'Residential' || useType === 'Both') ? bedrooms : null,
        bathrooms: (useType === 'Residential' || useType === 'Both') ? bathrooms : null,
        businessName: (useType === 'Commercial' || useType === 'Both') ? businessName : null,
        licenseNumber: (useType === 'Commercial' || useType === 'Both') ? licenseNumber : null,
      };

      if (interiorPhotos.length > 0) {
        unitData.interiorPhotos = interiorPhotos;
      }
      if (signboardPhotos.length > 0) {
        unitData.signboardPhotos = signboardPhotos;
      }

      if (unitId) {
        const unit = await Unit.findByPk(unitId);
        if (!unit) return res.status(404).send('Unit not found');
        Object.assign(unit, unitData);
        await unit.save();
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/plot/${plotId}/building/${buildingId}/unit/${unit.id}/view`);
      } else {
        await Unit.create(unitData);
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcelId}/plot/${plotId}/building/${buildingId}/units`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to save unit');
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


module.exports = router;

