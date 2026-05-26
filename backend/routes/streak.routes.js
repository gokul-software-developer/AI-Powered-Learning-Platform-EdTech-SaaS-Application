const router = require('express').Router();
const streakController = require('../controllers/streak.controller');

router.get('/:userId', streakController.getStreak);
router.post('/:userId', streakController.updateStreak);

module.exports = router;