const express = require('express');
const router = express.Router();
const notionController = require('../controllers/notion.controller');

// Redirect user to Notion's OAuth page
router.get('/login', notionController.notionLogin);

// Handle Notion's callback
router.get('/callback', notionController.notionCallback);
router.get('/status', notionController.checkNotionStatus);
router.get('/select-notion-page', notionController.selectPage);
router.post('/set-notion-page', notionController.setParentPage);
router.get('/fetched-pages', notionController.getFetchedPages);

module.exports = router;
