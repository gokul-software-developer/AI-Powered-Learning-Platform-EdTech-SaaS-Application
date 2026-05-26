// In gamification.controller.js
const { User, Streak } = require('../models'); // Adjust path as necessary

// Award points and update streak
exports.awardPoints = async (req, res) => {
  const { userId, points } = req.body;

  if (!userId || !points) {
    return res.status(400).json({ error: 'userId and points are required' });
  }

  try {
    const user = await User.findByPk(userId, { include: Streak });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update or create streak
    let streak = user.Streak;

    const today = new Date();
    const lastUpdated = streak?.lastUpdated ? new Date(streak.lastUpdated) : null;

    if (streak) {
      const daysDiff = Math.floor((today - lastUpdated) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        streak.count += 1;
      } else if (daysDiff > 1) {
        streak.count = 1; // reset streak
      }
      streak.lastUpdated = today;
      await streak.save();
    } else {
      streak = await Streak.create({ count: 1, lastUpdated: today, UserId: userId });
    }


    return res.status(200).json({
      message: `Awarded ${points} points to user ${user.name}`,
      currentStreak: streak.count,
    });
  } catch (err) {
    console.error('Error awarding points:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
