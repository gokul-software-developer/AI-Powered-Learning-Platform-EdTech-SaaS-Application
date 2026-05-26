const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// 💡 Place specific routes first
router.get('/user', courseController.getCoursesByUserId); // uses session
router.get('/user/:userId', courseController.getCoursesByUserId); // optional: if you still want to support params

router.get('/course/search', courseController.searchCourses);
router.post('/enroll', courseController.enrollCourse);

router.get('/', courseController.getAllCourses);
router.post('/', courseController.createCourse);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
