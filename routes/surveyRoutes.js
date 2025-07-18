const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');

// View all surveys
router.get('/', surveyController.getAllSurveys);

// Show form to add survey
router.get('/add', surveyController.showAddForm);

// Handle add survey
router.post('/add', surveyController.addSurvey);

// Delete Survey
router.post('/:surveyId/delete', surveyController.deleteSurvey);



module.exports = router;
