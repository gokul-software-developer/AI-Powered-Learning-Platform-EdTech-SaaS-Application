// routes/studyProgressRoutes.js
const express = require('express');
const router = express.Router();
const studyProgressController = require('../controllers/studyProgress.controller');

// ========================
// PROGRESS CRUD ROUTES
// ========================

// Get all progress for a user
router.get('/study-progress', studyProgressController.getAllStudyProgress);

// Get specific progress entry
router.get('/study-progress/:id', studyProgressController.getStudyProgressById);

// Create new progress entry
router.post('/study-progress', studyProgressController.createStudyProgress);

// Update progress entry
router.put('/study-progress/:id', studyProgressController.updateStudyProgress);

// Delete progress entry
router.delete('/study-progress/:id', studyProgressController.deleteStudyProgress);

// ========================
// TODAY'S PROGRESS
// ========================

// Get today's progress for a user
router.get('/study-progress/today/:userId', studyProgressController.getTodayProgress);

// Update today's progress (create if doesn't exist)
router.patch('/study-progress/today/:userId', studyProgressController.updateTodayProgress);

// ========================
// STREAK & ANALYTICS ROUTES
// ========================

// Get all streak data (current, longest, monthly goal, weekly progress)
router.get('/study-progress/streaks/:userId', studyProgressController.getStreakData);

// Get progress by date range
router.get('/study-progress/range/:userId', studyProgressController.getProgressByDateRange);

// ========================
// USER PREFERENCES
// ========================

// Get user preferences
router.get('/study-progress/preferences/:userId', studyProgressController.getUserPreferences);

// Update user preferences
router.put('/study-progress/preferences/:userId', studyProgressController.updateUserPreferences);

module.exports = router;