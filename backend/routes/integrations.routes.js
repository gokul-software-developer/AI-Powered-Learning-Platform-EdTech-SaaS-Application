const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integration.controller');

// router.get('/google/auth-url', integrationController.getGoogleAuthUrl);
router.get('/google/callback', integrationController.googleCallback);
//router.post('/google/events', integrationController.createEvent);
// router.put('/google/events/:eventId', integrationController.updateEvent);
// router.delete('/google/events/:eventId', integrationController.deleteEvent);

module.exports = router;
