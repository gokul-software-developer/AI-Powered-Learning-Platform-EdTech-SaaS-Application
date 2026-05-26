const express = require('express');
// const { route } = require('./auth.routes');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
// router.use('/users', require('./user.routes'));
// router.use('/plans', require('./plans.routes'));

//r//outer.use('/streaks', require('./streak.routes'));
router.use('/integrations', require('./integrations.routes'));

router.use('/features', require('./userFeatures.routes'));
router.use('/gamification', require('./gamification.routes'));  
router.use('/recommendations', require('./recc.routes'));// Add this line for session routes:
router.use('/session', require('./session.routes'));  

router.use('/videos', require('./video.routes'));

router.use('/courses', require('./course.routes'));

router.use('/keywords', require('./keywords.routes'));
router.use('/quiz', require('./quiz.routes'));
router.use('/certificate', require('./certificate.routes'));

router.use('/todolist', require('./todolist.routes'));

router.use('/studyplan', require('./studyPlan.routes'));

router.use('/registered-courses', require('./studyPlan.routes'));
router.use('/group', require('./group.routes'));
router.use('/notion', require('./notion.routes'));
router.use('/profile', require('./userProfile.routes'));
router.use('/search', require('./search.routes'));
router.use('/streak', require('./streak.routes')); // Add this line for streak routes
module.exports = router;
