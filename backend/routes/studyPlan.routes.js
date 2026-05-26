// routes/studyPlanRoutes.js
const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlan.Controller');




// Study Plans Routes
router.get('/study-plans', studyPlanController.getAllStudyPlans);
router.post('/study-plans', studyPlanController.createStudyPlan);
router.put('/study-plans/:id', studyPlanController.updateStudyPlan);
router.delete('/study-plans/:id', studyPlanController.deleteStudyPlan);
router.get('/registered-courses', studyPlanController.getRegisteredCourses);
router.get('/study-plans/user/:userId', studyPlanController.getStudyPlansByUser);
router.get('/study-plans/:id/with-courses', studyPlanController.getStudyPlanWithCourses);
router.get('/:id/progress', studyPlanController.getStudyProgress);
router.get('/:id/course-progress', studyPlanController.getStudyPlanVideoProgress);
router.get('/study-plan/:id', studyPlanController.getStudyPlanById);

router.get('/test-course-model', async (req, res) => {
    try {
      const { Course } = require('../models');
      const courseCount = await Course.count();
      const courses = await Course.findAll({ limit: 5 });
      res.json({ 
        message: 'Course model works', 
        courseCount,
        sampleCourses: courses
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    } });

module.exports = router;