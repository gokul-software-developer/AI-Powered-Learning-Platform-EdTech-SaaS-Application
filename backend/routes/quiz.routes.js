// // const express = require("express");
// // const router = express.Router();
// // const quizController = require("../controllers/quiz.controller");

// // router.get("/", quizController.getAllQuizzes);
// // router.get("/:id", quizController.getQuizById);
// // router.post("/", quizController.createQuiz);
// // router.put("/:id", quizController.updateQuiz);
// // router.delete("/:id", quizController.deleteQuiz);

// // // Add this route:
// // router.post("/generate", quizController.generateQuiz);

// // module.exports = router;
// // routes/quiz.routes.js

// const express = require("express");
// const router = express.Router();
// const quizController = require("../controllers/quiz.controller");


// router.get("/", quizController.getAllQuizzes);
// router.get("/:id", quizController.getQuizById);
// router.post("/", quizController.createQuiz);
// router.put("/:id", quizController.updateQuiz);
// router.delete("/:id", quizController.deleteQuiz);
// router.post("/submit-score", quizController.submitQuizScore);
// router.post("/check-latest", quizController.checkLatestAttempt);

// // GPT-based quiz generation
// router.post("/generate", quizController.generateQuiz);

// module.exports = router;
// routes/quiz.routes.js

const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
router.get("/status", quizController.getQuizStatus);     
// Admin/test routes (optional for production)
router.get("/", quizController.getAllQuizzes);          // ✅ Fetch all quiz attempts
router.get("/:id", quizController.getQuizById);         // ✅ Get quiz attempt by ID
router.post("/", quizController.createQuiz);            // ✅ Manually create quiz attempt
router.put("/:id", quizController.updateQuiz);          // ✅ Update quiz attempt
router.delete("/:id", quizController.deleteQuiz);       // ✅ Delete quiz attempt

// Main quiz flow routes
router.post("/generate", quizController.generateQuiz);           // ✅ Generate quiz (GPT + store)
router.post("/submit-score", quizController.submitQuizScore);    // ✅ Submit score (calculates pass/fail)
        // ✅ Check if quiz attempted & passed today

module.exports = router;
