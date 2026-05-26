// const { UserFeatures } = require('../models');
// const openai = require('../config/openai');

// // Save selected features to DB with session user
// const saveFeatures = async (req, res) => {
//   try {
//     const { features } = req.body;
//     console.log("📥 Received features:", features);

//     // Check if user is logged in
//     const userId = req.session.userId;
//     console.log("User ID from session:", userId);
//     if (!userId) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     if (!Array.isArray(features) || features.length === 0) {
//       return res.status(400).json({ error: "Invalid or empty feature list" });
//     }

//     await UserFeatures.create({
//       user_id: userId,
//       selected_features: features,
//     });

//     console.log("✅ Features saved successfully");
//     res.status(201).json({ message: "Features saved successfully" });
//   } catch (err) {
//     console.error("❌ Error saving features:", err.message);
//     res.status(500).json({ error: "Internal server error", detail: err.message });
//   }
// };

// // ✅ AI route to get related topics (corrected)
// const getRelatedTopics = async (req, res) => {
//   // Changed from req.body to req.query as per typical GET request usage
//   const topic = req.query.topic || req.body.topic;

//   if (!topic || typeof topic !== 'string') {
//     return res.status(400).json({ error: "Invalid or missing topic" });
//   }

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4.1-nano",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You're an expert in educational topics. When given a subject, return 5 related subtopics as an array."
//         },
//         {
//           role: "user",
//           content: `Give me 5 specific subtopics related to "${topic}". Return ONLY a JSON array like: ["sub1", "sub2", "sub3", "sub4", "sub5"]`
//         }
//       ],
//       temperature: 0.6,
//     });

//     const reply = response.choices[0]?.message?.content;

//     // Parse JSON safely with try/catch
//     let relatedTopics;
//     try {
//       relatedTopics = JSON.parse(reply);
//     } catch (parseErr) {
//       console.error("❌ Failed to parse AI response as JSON:", parseErr, "Response:", reply);
//       return res.status(500).json({
//         error: "AI response malformed",
//         detail: "Failed to parse AI returned data as JSON array",
//       });
//     }

//     console.log(`🤖 Related topics for "${topic}":`, relatedTopics);
//     res.json({ relatedTopics });
//   } catch (err) {
//     console.error("❌ AI error:", err.message);
//     res.status(500).json({ error: "Failed to get related topics", detail: err.message });
//   }
// };

// module.exports = {
//   saveFeatures,
//   getRelatedTopics,
// };
const { UserFeatures } = require('../models');
const openai = require('../config/openai');

// Save selected features to DB with session user
const saveFeatures = async (req, res) => {
  try {
    const { features } = req.body;
    console.log("📥 Received features:", features);

    // Check if user is logged in
    const userId = req.session.userId;
    console.log("User ID from session:", userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ error: "Invalid or empty feature list" });
    }

    await UserFeatures.create({
      user_id: userId,
      selected_features: features,
    });

    console.log("✅ Features saved successfully");
    res.status(201).json({ message: "Features saved successfully" });
  } catch (err) {
    // Enhanced error logging here:
    console.error("❌ Error saving features:");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    if (err.cause) console.error("Cause:", err.cause);
    console.error("Full error object:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
};

// AI route to get related topics
const getRelatedTopics = async (req, res) => {
  // Use topic from POST body first, fallback to query string if necessary
  const topic = req.body.topic || req.query.topic;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: "Invalid or missing topic" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "You're an expert in educational topics. When given a subject, return 5 related subtopics as an array."
        },
        {
          role: "user",
          content: `Give me 5 specific subtopics related to "${topic}". Return ONLY a JSON array like: ["sub1", "sub2", "sub3", "sub4", "sub5"]`
        }
      ],
      temperature: 0.6,
    });

    const reply = response.choices[0]?.message?.content;

    // Parse the AI's JSON response safely
    let relatedTopics;
    try {
      relatedTopics = JSON.parse(reply);
    } catch (parseErr) {
      console.error("❌ Failed to parse AI response as JSON:");
      console.error("Parse Error:", parseErr);
      console.error("AI Reply content:", reply);
      return res.status(500).json({
        error: "AI response malformed",
        detail: "Failed to parse AI returned data as JSON array",
      });
    }

    console.log(`🤖 Related topics for "${topic}":`, relatedTopics);
    res.json({ relatedTopics });
  } catch (err) {
    // Enhanced error logging here:
    console.error("❌ AI error:");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    if (err.cause) console.error("Cause:", err.cause);
    console.error("Full error object:", err);
    res.status(500).json({ error: "Failed to get related topics", detail: err.message });
  }
};

module.exports = {
  saveFeatures,
  getRelatedTopics,
};