const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');

router.post('/award-points', gamificationController.awardPoints);

module.exports = router;
