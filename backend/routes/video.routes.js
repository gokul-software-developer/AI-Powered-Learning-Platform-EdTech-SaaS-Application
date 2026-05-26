const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.post('/', videoController.createVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);
router.get('/course/:courseId', videoController.getVideosByCourseId);
router.put('/progress/:videoId', videoController.updateVideoProgress);
router.get('/course/progress/:courseId', videoController.getTotalVideoProgress);
router.post('/video', videoController.createIndididualVideo);

module.exports = router;