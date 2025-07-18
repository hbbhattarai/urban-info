const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const Plot = require('../models/Plot');
const Building = require('../models/Building');
const Unit = require('../models/Unit');
const Residential = require('../models/ResidentialDetails');
const Commercial = require('../models/CommercialDetails');
const Park = require('../models/Park');
const Street = require('../models/Street');
const path = require('path');
const surveyShapefileController = require('../controllers/surveyShapefileController');
const multer = require('multer');
const Shapefile = require('../models/Shapefile');

// API to return shapefile data as GeoJSON
router.get('/get-data/:surveyId', surveyShapefileController.getData);

// View survey dashboard
router.get('/view/:surveyId', surveyShapefileController.renderSurveyData);

// Multer setup for uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Parcel type selection page
router.get('/:surveyId/survey/parcel/:featureId', (req, res) => {
  const { featureId } = req.params;
  const { surveyId } = req.params;
  res.render('surveyor/parcelTypeSelection', { featureId, surveyId });
});


// Handle parcel type form submission
router.post('/:surveyId/survey/parcel/:featureId', async (req, res) => {
  const { featureId } = req.params;
  const { surveyId } = req.params;
  const { type } = req.body;


  try {
    let parcel = await Parcel.findOne({ where: { featureId } });
    if (parcel) {
      parcel.type = type;
      await parcel.save();
      if (type === 'park') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/park`);
      } else if (type === 'plot') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/plot`);
      } else if (type === 'street') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/street`);
      }
    } else {
      await Parcel.create({ featureId, type });
      if (type === 'park') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/park`);
      } else if (type === 'plot') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/plot`);
      } else if (type === 'street') {
        res.redirect(`/editor/surveys/${surveyId}/survey/parcel/${parcel.id}/street`);
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Modfied One

// Park Routes

router.get('/:surveyId/survey/parcel/:parcelId/park', (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;
  res.render('surveyor/parkDetails', { parcelId, surveyId });
});

router.post('/:surveyId/survey/parcel/:parcelId/park',
  upload.array('parkPhotos', 10),
  async (req, res) => {
    const { parcelId } = req.params;
    const { surveyId } = req.params;
    const { status } = req.body;
    const { name, areaSize, parkType } = req.body;

    try {


      let park = await Park.findOne({ where: { parcelId: parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });
      if (shapefile) {
        shapefile.status = status;
        await shapefile.save();
      }
      const photosUrls = req.files
        ? req.files.map((f) => `/uploads/${f.filename}`).join(',')
        : '';

      if (park) {
        park.name = name;
        park.areaSize = areaSize || null;
        park.parkType = parkType;
        if (photosUrls) park.photos = photosUrls;
        await park.save();
      } else {
        await Park.create({
          parcelId: parcelId,
          name,
          areaSize,
          parkType,
          photos: photosUrls
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

router.get('/:surveyId/survey/parcel/:parcelId/street', (req, res) => {
  const { parcelId } = req.params;
  const { surveyId } = req.params;

  res.render('surveyor/streetDetails', { parcelId, surveyId });
});

router.post('/:surveyId/survey/parcel/:parcelId/street',
  upload.array('photos', 10), // Match the `name="photos"` in form
  async (req, res) => {
    const { parcelId, surveyId } = req.params;
    const { status } = req.body;
    const {
      streetType,
      materialUsed,
      paved,
      notes
    } = req.body;

    try {
      let street = await Street.findOne({ where: { parcelId: parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });
      if (shapefile) {
        shapefile.status = status;
        await shapefile.save();
      }

      const photoUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];

      if (street) {
        street.streetType = streetType;
        street.materialUsed = materialUsed;
        street.paved = paved === 'on'; // checkbox returns 'on' if checked
        street.notes = notes;
        if (photoUrls.length > 0) street.photos = photoUrls;
        await street.save();
      } else {
        await Street.create({
          parcelId: parcelId,
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
    res.render('surveyor/plotDetails', { parcelId, surveyId, plot });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/:surveyId/survey/parcel/:parcelId/plot',
  upload.array('facadePhotos', 10), // Match the `name="photos"` in form
  async (req, res) => {
    const { parcelId, surveyId } = req.params;
    const { status } = req.body;
    const {
      isConstructed
    } = req.body;

    try {
      let plot = await Plot.findOne({ where: { parcelId } });
      let parcel = await Parcel.findOne({ where: { id: parcelId } });
      let shapefile = await Shapefile.findOne({ where: { id: parcel.featureId } });

      if (shapefile) {
        shapefile.status = status;
        await shapefile.save();
      }

      const photoUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];

      if (plot) {
        plot.isConstructed = isConstructed === 'on';
        if (photoUrls.length > 0) plot.photos = photoUrls;
        await plot.save();
      } else {
        await Plot.create({
          parcelId,
          isConstructed: isConstructed === 'on',
          photos: photoUrls
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
    const building = await Building.findOne({ where: { plotId } });
    res.render('surveyor/buildingDetails', { surveyId, parcelId, plotId, building });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/:surveyId/survey/parcel/:parcelId/building/:plotId',
  upload.array('facadePhotos', 10), // should match name="facadePhotos" in form
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
      const photoUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];

      let building = await Building.findOne({ where: { plotId } });

      if (building) {
        // Update existing building
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
      } else {
        // Create new building
        await Building.create({
          plotId,
          name,
          ownerCid,
          yearBuilt,
          storeys,
          structureType,
          retrofitReady: retrofitReady === 'on',
          facadePhotos: photoUrls,
        });
      }

      res.redirect(`/editor/surveys/view/${surveyId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

















module.exports = router;

