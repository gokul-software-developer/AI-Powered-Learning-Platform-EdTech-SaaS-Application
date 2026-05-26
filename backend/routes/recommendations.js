// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// router.get('/recommendations', async (req, res) => {
//   const userId = req.user?.id || 'guest';

//   try {
//     const keywords = await db.getKeywordsForUser(userId);
//     if (!keywords || keywords.length === 0) return res.json([]);

//     const selected = keywords.sort(() => 0.5 - Math.random()).slice(0, 2);
//     const allCourses = await db.getAllCourses();

//     const recommended = allCourses.filter(course =>
//       selected.some(keyword =>
//         course.title.toLowerCase().includes(keyword.toLowerCase()) ||
//         course.description.toLowerCase().includes(keyword.toLowerCase())
//       )
//     );

//     const shuffled = recommended.sort(() => 0.5 - Math.random()).slice(0, 3);
//     res.json(shuffled);
//   } catch (err) {
//     console.error('Recommendation error:', err);
//     res.status(500).json({ error: 'Failed to fetch recommendations' });
//   }
// });

// module.exports = router;
