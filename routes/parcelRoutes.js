const express = require('express');
const { upsertParcel } = require('../controllers/parcelController');
const router = express.Router();

router.put('/:featureId', upsertParcel);

module.exports = router;
