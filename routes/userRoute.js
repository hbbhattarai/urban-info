const express = require('express');
const { Op, col } = require('sequelize');
const router = express.Router();
const {
  Survey,
  Shapefile,
  Parcel,
  Park,
  Street,
  Plot,
  Building,
  Unit
} = require('../models');

router.get('/view/:survey_id', async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.survey_id, {
      include: [
        {
          model: Shapefile,
          include: [
            {
              model: Parcel,
              include: [
                { model: Park },
                { model: Street },
                {
                  model: Plot,
                  include: [
                    {
                      model: Building,
                      include: [Unit]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!survey) {
      return res.status(404).render('404', { message: 'Survey not found' });
    }

    res.render('surveyView', { survey });
  } catch (error) {
    console.error('Error fetching survey data:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});


module.exports = router;

