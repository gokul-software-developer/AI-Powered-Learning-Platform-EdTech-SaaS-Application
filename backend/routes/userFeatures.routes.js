const express = require('express');
const router = express.Router();
const userFeaturesController = require('../controllers/userFeatures.controller');

router.post('/save-features', userFeaturesController.saveFeatures);
router.post('/generate/related-topics', userFeaturesController.getRelatedTopics);

module.exports = router;