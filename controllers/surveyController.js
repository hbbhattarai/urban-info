const Survey = require('../models/Survey');
const ShapefileModel = require('../models/Shapefile');

exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.findAll();
    res.render('surveys/index', { surveys });
  } catch (err) {
    res.status(500).send('Error fetching surveys: ' + err.message);
  }
};

exports.showAddForm = (req, res) => {
  res.render('surveys/add');
};

exports.addSurvey = async (req, res) => {
  const { name, description } = req.body;
  try {
    await Survey.create({ name, description });
    res.redirect('/admin/surveys');
  } catch (err) {
    res.status(500).send('Error creating survey: ' + err.message);
  }
};

exports.deleteSurvey = async (req, res) => {
  const surveyId = req.params.surveyId;

  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return res.status(404).send('Survey not found');

    // Delete related shapefile data
    await ShapefileModel.destroy({ where: { survey_id: surveyId } });

    // Delete the survey itself
    await survey.destroy();

    res.redirect('/admin/surveys'); // or your survey list page
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete survey');
  }
};


