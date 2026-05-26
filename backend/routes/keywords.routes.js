const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywords.controller');

router.get('/', keywordController.getAllKeywords);
router.get('/:id', keywordController.getKeywordById);
router.post('/', keywordController.createKeyword);
router.put('/:id', keywordController.updateKeyword);
router.delete('/:id', keywordController.deleteKeyword);
router.get('/course/:courseId', keywordController.getKeywordsByCourseId);

module.exports = router;