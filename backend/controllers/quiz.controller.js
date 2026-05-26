const { OpenAI } = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const db = require("../models");
const Quiz = db.QuizAttempt;
const Course = db.Course;
const Keywords = db.Keywords;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.findAll();
  res.json(quizzes);
};

const getQuizById = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json(quiz);
};

const createQuiz = async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json(quiz);
};

const updateQuiz = async (req, res) => {
  await Quiz.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Quiz updated" });
};

const deleteQuiz = async (req, res) => {
  await Quiz.destroy({ where: { id: req.params.id } });
  res.json({ message: "Quiz deleted" });
};


const getQuizStatus = async (req, res) => {
  try {
   // console.log("🔍 Session object:", req.session);
    const user_id = req.session.userId;
    const course_id_raw = req.query.courseId;

    console.log("📦 Raw course ID from query:", course_id_raw);
    const course_id = parseInt(course_id_raw);
    if (!user_id || isNaN(course_id)) {
      //console.log("❌ Missing user session or invalid courseId");
      return res.status(400).json({ error: "Missing user session or courseId" });
    }

    const today = new Date().toISOString().split("T")[0];
    //console.log(`📅 Looking for quiz attempt on ${today} for user ${user_id} and course ${course_id}`);

    const quiz = await Quiz.findOne({
      where: {
        user_id,
        course_id,
        date: today,
      },
    });

  
  if (!quiz) {
 // console.log("📭 No quiz attempt found for today");
  return res.json({ attempted: false });
}

 // ✅ Only treat as attempted if submitted
    if (quiz.score === null || quiz.passed === null) {
      return res.json({ attempted: false });
    }

console.log("✅ Quiz attempt submitted:", quiz.id);
return res.json({
  attempted: true,
  passed: quiz.passed,
  score: quiz.score,
  createdAt: quiz.createdAt,
});

  } catch (err) {
    console.error("❌ Internal error in getQuizStatus:", err.message);
    return res.status(500).json({ error: "Internal error", details: err.message });
  }
};


// ✅ Submit Score (Updated scoring logic)

// const submitQuizScore = async (req, res) => {
//   const user_id = req.session.userId;
//   const { course_id, responses } = req.body;

//   if (!user_id || !course_id || !responses) {
//     return res.status(400).json({ error: "Missing data" });
//   }

//   const today = new Date().toISOString().split("T")[0];

//   try {
//     const attempt = await Quiz.findOne({
//       where: {
//         user_id,
//         course_id,
//         date: today,
//       },
//     });

//     if (!attempt) return res.status(404).json({ error: "No quiz found for today." });

//     const quizData = attempt.quiz_data;
//     const questions = quizData?.questions;

//     if (!questions || !Array.isArray(questions)) {
//       return res.status(400).json({ error: "Quiz data is missing or invalid format" });
//     }

//     let score = 0;

//     // ✅ Flat question array, each correct = 2 marks
//     questions.forEach((q, index) => {
//       const userAnswer = responses[index];
//       if (userAnswer && userAnswer === q.answer) {
//         score += 2;
//       }
//     });

//     const percentage = (score / 50) * 100;
//     const passed = score >= 20;

//     await attempt.update({ score, passed });

//     res.json({
//       message: "Score submitted",
//       score,
//       percentage: Math.round(percentage * 100) / 100,
//       passed,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const submitQuizScore = async (req, res) => {
  const user_id = req.session.userId;
  const { course_id, responses } = req.body;

  if (!user_id || !course_id || !responses) {
    return res.status(400).json({ error: "Missing data" });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const attempt = await Quiz.findOne({
      where: { user_id, course_id, date: today }
    });

    if (!attempt) return res.status(404).json({ error: "No quiz found for today." });

    const quizData = attempt.quiz_data;
    const questions = quizData?.questions;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Quiz data missing or invalid format" });
    }

    if (responses.length !== questions.length) {
      return res.status(400).json({ error: "Answer count does not match question count" });
    }

    let score = 0;
    const POINTS_PER_QUESTION = 2;

    questions.forEach((q, idx) => {
      const userAnswer = responses[idx];
      if (userAnswer && userAnswer === q.answer) {
        score += POINTS_PER_QUESTION;
      }
    });

    const maxScore = questions.length * POINTS_PER_QUESTION;
    const percentage = (score / maxScore) * 100;
    const PASS_THRESHOLD = 40; // percent required to pass
    const passed = percentage >= PASS_THRESHOLD;

    await attempt.update({ score, passed });

    res.json({
      message: "Score submitted",
      score,
      percentage: Math.round(percentage * 100) / 100,
      passed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateQuiz = async (req, res) => {
  console.log("📥 Quiz generation triggered");

  const user_id = req.session.userId;
  const { courseId, keywordIds } = req.body;

  if (!user_id || !courseId || !Array.isArray(keywordIds)) {
    return res.status(400).json({ error: "Missing user session or invalid payload" });
  }

  const t = await db.sequelize.transaction(); // Begin transaction
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if a quiz already exists for today within the transaction
    const existing = await Quiz.findOne({
      where: {
        user_id,
        course_id: courseId,
        date: today,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existing) {
      // ✅ If already submitted, block
      if (existing.score !== null && existing.passed !== null) {
        await t.rollback();
        return res.status(403).json({ error: "You already attempted this quiz today" });
      }

      // ✅ If generated but not submitted, return existing quiz
      await t.commit();
      console.log("♻️ Returning existing unsubmitted quiz:", existing.id);
      return res.status(200).json({ quiz: existing.quiz_data, saved: true });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      await t.rollback();
      return res.status(404).json({ error: "Course not found" });
    }

    const keywords = await Keywords.findAll({ where: { id: keywordIds } });
    const topics = keywords.map(k => k.keyword);

    if (!topics.length) {
      await t.rollback();
      return res.status(400).json({ error: "No topics found" });
    }

const prompt = `
You are a professional quiz generator.

Your task is to generate **exactly 21** unique, high-quality multiple-choice questions (MCQs) in valid JSON format.

Each question must contain:
- "question": a clear and specific question strictly related to the given course and keywords
- "options": an array of 4 distinct, meaningful choices (avoid overlap or trivial distractors). The **correct answer must be randomly positioned**, not always the first option.
- "answer": the correct answer string that matches one of the options exactly

⚠️ CRITICAL RULES:
- Generate **exactly 21** questions. Do **not return more or fewer**.
- All questions must be based strictly on:
  - Course Name: "${course.course_name}"
  - Keywords/Topics: ${topics.join(", ")}
- Questions must be 100% unique — no repeats or close variations.
- Keep the language concise, professional, and accurate.
- Do not include any explanation, reasoning, or text outside the JSON.
- The **correct answer MUST appear in a RANDOM position** among the 4 options.
- Do **not** place all correct answers in the first option.
- If you cannot generate exactly 21 valid questions, return this JSON: { "error": "Generation failed. Could not produce 21 unique questions." }

✅ FORMAT:
{
  "questions": [
    {
      "question": "Your question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct Option"
    },
    ...
    // 21 questions in total
  ]
}
`;





    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content.trim();
    console.log("🧪 Raw GPT response:", raw);

    const quizJson = JSON.parse(raw);
    const questions = quizJson.questions;
    
    console.log("🧠 Generated Questions Count:", questions.length);
    // Shuffle helper
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Shuffle options for each question
const shuffledQuestions = questions.map((q) => {
  const shuffledOptions = shuffleArray([...q.options]);
  return {
    question: q.question,
    options: shuffledOptions,
    answer: q.answer, // Still valid, string match logic will work
  };
});

const finalQuiz = { questions: shuffledQuestions };

  //console.log("✅ AI generated questions count:", questions.length);
    const savedQuiz = await Quiz.create({
      user_id,
      course_id: courseId,
      quiz_data: finalQuiz,
      date: today,
      score: null,
      passed: null,
    }, { transaction: t });

    await t.commit(); // ✅ Commit transaction
    console.log("✅ New quiz saved:", savedQuiz.id);
    return res.status(200).json({ quiz: finalQuiz, saved: true });
  } catch (err) {
    await t.rollback(); // ❌ Rollback on error
    console.error("🚨 Quiz generation failed:", err.message);
    return res.status(500).json({ error: "Quiz generation failed", details: err.message });
  }
};



module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  generateQuiz,
  submitQuizScore,
  getQuizStatus, // ✅ new
};
