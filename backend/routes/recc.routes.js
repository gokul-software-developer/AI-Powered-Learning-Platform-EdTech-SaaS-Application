const express = require("express");
const router = express.Router();

const reccController = require("../controllers/recc.controller");

// Route: GET /api/recommendations/:userId
router.get("/", reccController.getRecommendations);

module.exports = router;
