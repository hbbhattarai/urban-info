var express = require('express');
var cors = require('cors');
var surveyShapefileController = require('../controllers/surveyShapefileController');
var upload = require('../middlewares/upload');

var router = express.Router();
router.use(cors());




// API to return shapefile data as GeoJSON
router.get('/get-data/:surveyId', surveyShapefileController.getData);


// Show form to upload hsapefile
router.get('/upload/:surveyId', surveyShapefileController.showUploadForm);

//view data
router.get('/view/:surveyId', surveyShapefileController.viewSurveyData);

// Upload shapefile parts (.shp and .dbf required; .shx optional)
router.post(
  '/upload/:surveyId',
  upload.fields([
    { name: 'shp', maxCount: 1 },
    { name: 'dbf', maxCount: 1 },
    { name: 'shx', maxCount: 1 }, 
    { name: 'prj', maxCount: 1 },
  ]),
  surveyShapefileController.uploadShapefile
);

module.exports = router;