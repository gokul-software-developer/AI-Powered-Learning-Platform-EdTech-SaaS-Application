// controllers/studyProgressController.js
const { StudyProgress, UserPreferences } = require('../models');
const { Op } = require('sequelize');

const studyProgressController = {
  
  // ========================
  // PROGRESS CRUD OPERATIONS
  // ========================
  
  // GET /api/study-progress?userId=1
  getAllStudyProgress: async (req, res) => {
    try {
      const { userId, limit = 30 } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const progress = await StudyProgress.findAll({
        where: { user_id: parseInt(userId) },
        order: [['study_date', 'DESC']],
        limit: parseInt(limit)
      });
      
      res.json({ progress });
    } catch (error) {
      console.error('Error fetching study progress:', error);
      res.status(500).json({ error: 'Failed to fetch study progress' });
    }
  },

  // GET /api/study-progress/:id
  getStudyProgressById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const progress = await StudyProgress.findByPk(parseInt(id));
      
      if (!progress) {
        return res.status(404).json({ error: 'Study progress not found' });
      }
      
      res.json({ progress });
    } catch (error) {
      console.error('Error fetching study progress:', error);
      res.status(500).json({ error: 'Failed to fetch study progress' });
    }
  },

  // POST /api/study-progress
  createStudyProgress: async (req, res) => {
    try {
      const { user_id, plan_id, study_date, minutes_studied, target_minutes, notes } = req.body;
      
      if (!user_id || !study_date) {
        return res.status(400).json({ error: 'user_id and study_date are required' });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(study_date)) {
        return res.status(400).json({ error: 'study_date must be in YYYY-MM-DD format' });
      }
      
      // Get user preferences for default target
      const preferences = await UserPreferences.findOne({ where: { user_id: parseInt(user_id) } });
      const defaultTarget = preferences ? preferences.daily_study_target : 60;
      
      const finalMinutesStudied = minutes_studied || 0;
      const finalTargetMinutes = target_minutes || defaultTarget;
      const completed = finalMinutesStudied >= finalTargetMinutes;
      
      const progress = await StudyProgress.create({
        user_id: parseInt(user_id),
        plan_id: plan_id ? parseInt(plan_id) : null,
        study_date,
        minutes_studied: finalMinutesStudied,
        target_minutes: finalTargetMinutes,
        completed,
        notes
      });
      
      res.status(201).json({ progress });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Progress already exists for this date' });
      }
      console.error('Error creating study progress:', error);
      res.status(500).json({ error: 'Failed to create study progress' });
    }
  },

  // PUT /api/study-progress/:id
  updateStudyProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const { minutes_studied, target_minutes, notes } = req.body;
      
      const progress = await StudyProgress.findByPk(parseInt(id));
      
      if (!progress) {
        return res.status(404).json({ error: 'Study progress not found' });
      }
      
      const updatedMinutes = minutes_studied !== undefined ? minutes_studied : progress.minutes_studied;
      const updatedTarget = target_minutes !== undefined ? target_minutes : progress.target_minutes;
      const completed = updatedMinutes >= updatedTarget;
      
      await progress.update({
        minutes_studied: updatedMinutes,
        target_minutes: updatedTarget,
        completed,
        notes: notes !== undefined ? notes : progress.notes
      });
      
      res.json({ progress });
    } catch (error) {
      console.error('Error updating study progress:', error);
      res.status(500).json({ error: 'Failed to update study progress' });
    }
  },

  // DELETE /api/study-progress/:id
  deleteStudyProgress: async (req, res) => {
    try {
      const { id } = req.params;
      
      const progress = await StudyProgress.findByPk(parseInt(id));
      
      if (!progress) {
        return res.status(404).json({ error: 'Study progress not found' });
      }
      
      await progress.destroy();
      res.json({ message: 'Study progress deleted successfully' });
    } catch (error) {
      console.error('Error deleting study progress:', error);
      res.status(500).json({ error: 'Failed to delete study progress' });
    }
  },

  // ========================
  // TODAY'S PROGRESS
  // ========================
  
  // GET /api/study-progress/today/:userId
  getTodayProgress: async (req, res) => {
    try {
      const { userId } = req.params;
      const today = getTodayDateString();
      
      let progress = await StudyProgress.findOne({
        where: {
          user_id: parseInt(userId),
          study_date: today
        }
      });
      
      // If no progress for today, create a default entry
      if (!progress) {
        const preferences = await UserPreferences.findOne({ where: { user_id: parseInt(userId) } });
        const defaultTarget = preferences ? preferences.daily_study_target : 60;
        
        progress = await StudyProgress.create({
          user_id: parseInt(userId),
          study_date: today,
          minutes_studied: 0,
          target_minutes: defaultTarget,
          completed: false
        });
      }
      
      res.json({ progress });
    } catch (error) {
      console.error('Error fetching today\'s progress:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s progress' });
    }
  },

  // PATCH /api/study-progress/today/:userId
  updateTodayProgress: async (req, res) => {
    try {
      const { userId } = req.params;
      const { minutes_studied, notes } = req.body;
      const today = getTodayDateString();
      
      // Validate minutes_studied if provided
      if (minutes_studied !== undefined && (minutes_studied < 0 || !Number.isInteger(minutes_studied))) {
        return res.status(400).json({ error: 'minutes_studied must be a non-negative integer' });
      }
      
      let progress = await StudyProgress.findOne({
        where: {
          user_id: parseInt(userId),
          study_date: today
        }
      });
      
      if (!progress) {
        const preferences = await UserPreferences.findOne({ where: { user_id: parseInt(userId) } });
        const defaultTarget = preferences ? preferences.daily_study_target : 60;
        
        progress = await StudyProgress.create({
          user_id: parseInt(userId),
          study_date: today,
          minutes_studied: minutes_studied || 0,
          target_minutes: defaultTarget,
          completed: (minutes_studied || 0) >= defaultTarget,
          notes
        });
      } else {
        const finalMinutes = minutes_studied !== undefined ? minutes_studied : progress.minutes_studied;
        const completed = finalMinutes >= progress.target_minutes;
        
        await progress.update({
          minutes_studied: finalMinutes,
          completed,
          notes: notes !== undefined ? notes : progress.notes
        });
      }
      
      res.json({ progress });
    } catch (error) {
      console.error('Error updating today\'s progress:', error);
      res.status(500).json({ error: 'Failed to update today\'s progress' });
    }
  },

  // ========================
  // STREAK CALCULATIONS
  // ========================
  
  // GET /api/study-progress/streaks/:userId
  getStreakData: async (req, res) => {
    try {
      const { userId } = req.params;
      const userIdInt = parseInt(userId);
      
      const [currentStreak, longestStreak, monthlyGoal, todayProgress, weeklyProgress] = await Promise.all([
        calculateCurrentStreak(userIdInt),
        calculateLongestStreak(userIdInt),
        getMonthlyGoal(userIdInt),
        getTodayProgressData(userIdInt),
        getWeeklyProgress(userIdInt)
      ]);
      
      res.json({
        currentStreak,
        longestStreak,
        monthlyGoal,
        todayProgress,
        weeklyProgress
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
      res.status(500).json({ error: 'Failed to fetch streak data' });
    }
  },

  // GET /api/study-progress/range/:userId
  getProgressByDateRange: async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      // Validate date formats
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' });
      }
      
      const progress = await StudyProgress.findAll({
        where: {
          user_id: parseInt(userId),
          study_date: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['study_date', 'ASC']]
      });
      
      res.json({ progress });
    } catch (error) {
      console.error('Error fetching progress by date range:', error);
      res.status(500).json({ error: 'Failed to fetch progress by date range' });
    }
  },

  // ========================
  // USER PREFERENCES
  // ========================
  
  // GET /api/study-progress/preferences/:userId
  getUserPreferences: async (req, res) => {
    try {
      const { userId } = req.params;
      const userIdInt = parseInt(userId);
      
      let preferences = await UserPreferences.findOne({ where: { user_id: userIdInt } });
      
      if (!preferences) {
        preferences = await UserPreferences.create({
          user_id: userIdInt,
          daily_study_target: 60,
          monthly_goal_days: 20
        });
      }
      
      res.json({ preferences });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  },

  // PUT /api/study-progress/preferences/:userId
  updateUserPreferences: async (req, res) => {
    try {
      const { userId } = req.params;
      const { daily_study_target, monthly_goal_days } = req.body;
      const userIdInt = parseInt(userId);

      // Validate input
      if (daily_study_target !== undefined && (daily_study_target < 1 || daily_study_target > 1440)) {
        return res.status(400).json({ error: 'daily_study_target must be between 1 and 1440 minutes' });
      }
      if (monthly_goal_days !== undefined && (monthly_goal_days < 1 || monthly_goal_days > 31)) {
        return res.status(400).json({ error: 'monthly_goal_days must be between 1 and 31' });
      }
      
      let preferences = await UserPreferences.findOne({ where: { user_id: userIdInt } });
      
      if (!preferences) {
        preferences = await UserPreferences.create({
          user_id: userIdInt,
          daily_study_target: daily_study_target || 60,
          monthly_goal_days: monthly_goal_days || 20
        });
      } else {
        await preferences.update({
          daily_study_target: daily_study_target !== undefined ? daily_study_target : preferences.daily_study_target,
          monthly_goal_days: monthly_goal_days !== undefined ? monthly_goal_days : preferences.monthly_goal_days
        });
      }
      
      res.json({ preferences });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  }
};

// ========================
// HELPER FUNCTIONS
// ========================

function getTodayDateString() {
  // More reliable way to get today's date in YYYY-MM-DD format
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
}

async function calculateCurrentStreak(userId) {
  try {
    // Optimized: Get last 60 days of completed progress at once
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const recentProgress = await StudyProgress.findAll({
      where: {
        user_id: userId,
        study_date: {
          [Op.gte]: sixtyDaysAgo.toISOString().split('T')[0]
        },
        completed: true
      },
      order: [['study_date', 'DESC']],
      attributes: ['study_date']
    });

    if (recentProgress.length === 0) return 0;

    const today = getTodayDateString();
    let streak = 0;
    let currentDate = new Date();
    
    // Convert progress to a Set for O(1) lookup
    const completedDates = new Set(recentProgress.map(p => p.study_date));
    
    while (true) {
      const dateStr = currentDate.getFullYear() + '-' + 
                     String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(currentDate.getDate()).padStart(2, '0');
      
      if (completedDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Allow for today if no progress yet
        if (streak === 0 && dateStr === today) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating current streak:', error);
    return 0;
  }
}

async function calculateLongestStreak(userId) {
  try {
    const allProgress = await StudyProgress.findAll({
      where: {
        user_id: userId,
        completed: true
      },
      order: [['study_date', 'ASC']],
      attributes: ['study_date']
    });

    if (allProgress.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < allProgress.length; i++) {
      const prevDate = new Date(allProgress[i - 1].study_date);
      const currDate = new Date(allProgress[i].study_date);
      const diffTime = currDate - prevDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  } catch (error) {
    console.error('Error calculating longest streak:', error);
    return 0;
  }
}

async function getMonthlyGoal(userId) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const [preferences, monthlyProgress] = await Promise.all([
      UserPreferences.findOne({ where: { user_id: userId } }),
      StudyProgress.count({
        where: {
          user_id: userId,
          study_date: {
            [Op.between]: [
              startOfMonth.toISOString().split('T')[0],
              endOfMonth.toISOString().split('T')[0]
            ]
          },
          completed: true
        }
      })
    ]);
    
    const target = preferences ? preferences.monthly_goal_days : 20;
    
    return {
      target,
      current: monthlyProgress
    };
  } catch (error) {
    console.error('Error getting monthly goal:', error);
    return { target: 20, current: 0 };
  }
}

async function getTodayProgressData(userId) {
  try {
    const today = getTodayDateString();
    
    const progress = await StudyProgress.findOne({
      where: {
        user_id: userId,
        study_date: today
      }
    });
    
    if (!progress) {
      const preferences = await UserPreferences.findOne({ where: { user_id: userId } });
      return {
        studied: 0,
        target: preferences ? preferences.daily_study_target : 60
      };
    }
    
    return {
      studied: progress.minutes_studied,
      target: progress.target_minutes
    };
  } catch (error) {
    console.error('Error getting today\'s progress:', error);
    return { studied: 0, target: 60 };
  }
}

async function getWeeklyProgress(userId) {
  try {
    // Optimized: Get all 7 days at once
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    
    const weekProgress = await StudyProgress.findAll({
      where: {
        user_id: userId,
        study_date: {
          [Op.between]: [
            weekStart.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          ]
        },
        completed: true
      },
      attributes: ['study_date']
    });
    
    const completedDates = new Set(weekProgress.map(p => p.study_date));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDays = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      weekDays.push({
        date: dayName,
        studied: completedDates.has(dateStr)
      });
    }
    
    return weekDays;
  } catch (error) {
    console.error('Error getting weekly progress:', error);
    return Array(7).fill(0).map((_, i) => ({
      date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      studied: false
    }));
  }
}

module.exports = studyProgressController;