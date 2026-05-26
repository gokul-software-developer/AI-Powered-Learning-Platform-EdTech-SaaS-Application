const { Streak, StudyLog } = require('../models');

// Helper function to calculate streak metrics from study logs - unchanged
function calculateStreakMetrics(studyLogs) {
  const sortedLogs = [...studyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  let currentStreak = 0;
  let bestStreak = 0;
  let lastDate = null;

  sortedLogs.forEach(log => {
    if (!log.completed) {
      currentStreak = 0;
      lastDate = null;
      return;
    }

    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (lastDate === null) {
      currentStreak = 1;
    } else {
      const diff = (logDate - lastDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }
    lastDate = logDate;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  });

  return { currentStreak, bestStreak };
}

module.exports = {
  // GET streak info for user - unchanged

async getStreak(req, res) {
  try {
    const userId = parseInt(req.params.userId);

    // Ensure streak record exists
    let streak = await Streak.findOne({ where: { user_id: userId } });
    if (!streak) {
      streak = await Streak.create({
        user_id: userId,
        count: 0,
        best_count: 0,
        last_active_date: null,
      });
    }

    // Fetch all logs for this user
    const studyLogsRecords = await StudyLog.findAll({
      where: { user_id: userId },
      order: [['date', 'ASC']],
    });

    // Parse all logs
    const studyLogs = studyLogsRecords.map(log => ({
      date: log.date,
      completed: log.completed,
      minutesStudied: log.minutesStudied || 0,
    }));

    // Calculate streak info
    const { currentStreak, bestStreak } = calculateStreakMetrics(studyLogs);

    if (streak.count !== currentStreak || streak.best_count !== bestStreak) {
      streak.count = currentStreak;
      streak.best_count = bestStreak;
      await streak.save();
    }

    // Find today's log
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayLog = studyLogs.find(log => log.date === todayDate);

    // ----------- NEW AGGREGATE CALCULATIONS ---------

    // Last 7 days data (ending today)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = studyLogs.find(l => l.date === dateStr);
      days.push({
        date: dateStr,
        studied: !!(log && log.completed),
        minutesStudied: log ? log.minutesStudied : 0,
      });
    }

    // How many days in last 7 had a streak (studied/completed)
    const last7DaysStreakCount = days.filter(day => day.studied).length;

    // Monthly progress: days studied so far in this month
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1; // JS months 0-based, slice(0, 7) below will work
    const pad = n => (n < 10 ? `0${n}` : `${n}`);
    const thisMonthPrefix = `${y}-${pad(m)}-`;
    const monthlyDaysStudied = studyLogs.filter(
      log => log.completed && log.date.startsWith(thisMonthPrefix)
    ).length;

    // You can set this based on user's settings, here defaulting to 20
    const monthlyGoalDays = 20;
    const monthProgressPercent = Math.round(Math.min((monthlyDaysStudied / monthlyGoalDays) * 100, 100));

    // ------------------------------------------------- //

    return res.json({
      streak: {
        count: streak.count,
        best_count: streak.best_count,
        last_active_date: streak.last_active_date,
      },
      todayStudy: {
        minutesStudied: todayLog ? todayLog.minutesStudied : 0,
        completed: todayLog ? todayLog.completed : false,
      },
      last7Days: days,                        // array of objects, most recent last
      last7DaysStreakCount,                   // integer, for "days you kept your streak this week"
      monthlyGoalDays,                        // configurable
      monthlyDaysStudied,                     // integer: days studied in month
      monthProgressPercent,                   // integer: 0-100 (% of goal reached)
    });
  } catch (err) {
    console.error('Error fetching streak:', err);
    res.status(500).json({ message: 'Server error fetching data' });
  }
}

,

  // POST to update/add a study session and update streak if it meets/exceeds streakGoal
async updateStreak(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const { date, completed, minutesStudied } = req.body;

    if (!date || typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Date and completed status are required' });
    }

    // You may keep or adjust this threshold as per your app's needs
    const streakGoal = 5;

    // Find the study log for that user/date
    let log = await StudyLog.findOne({ where: { user_id: userId, date } });

    if (log) {
      // Accumulate minutes studied by adding the new minutes to existing value
      log.minutesStudied = (log.minutesStudied || 0) + (minutesStudied || 0);

      // Update the completed flag whenever received
      log.completed = completed;

      console.log(`Before save: User ${userId}, Date ${date}, Total Minutes ${log.minutesStudied}, Completed ${log.completed}`);

      await log.save();

      console.log(`Updated existing log for user ${userId} on ${date}, minutesStudied: ${log.minutesStudied}`);
    } else {
      // Create new study log record for the day
      log = await StudyLog.create({
        user_id: userId,
        date,
        completed,
        minutesStudied: minutesStudied || 0,
      });

      console.log(`Created new log for user ${userId} on ${date}, minutesStudied: ${log.minutesStudied}`);
    }

    // Fetch all study logs to recalc streaks
    const studyLogsRecords = await StudyLog.findAll({
      where: { user_id: userId },
      order: [['date', 'ASC']],
    });

    const studyLogs = studyLogsRecords.map(sl => ({
      date: sl.date,
      completed: sl.completed,
    }));

    const { currentStreak, bestStreak } = calculateStreakMetrics(studyLogs);

    let streak = await Streak.findOne({ where: { user_id: userId } });
    if (!streak) {
      streak = await Streak.create({
        user_id: userId,
        count: 0,
        best_count: 0,
        last_active_date: null,
      });
    }

    // Update streak if changed AND current streak is above or equal to streakGoal
    if ((streak.count !== currentStreak || streak.best_count < bestStreak) && currentStreak >= streakGoal) {
      streak.count = currentStreak;
      streak.best_count = bestStreak;
      streak.last_active_date = date;
      await streak.save();
      console.log(`Streak updated: current ${currentStreak}, best ${bestStreak}`);
    } else {
      console.log(`Streak unchanged or below streak goal (${streakGoal}), current streak: ${currentStreak}`);
    }

    return res.json({
      message: 'Study log updated, streak updated if goal met',
      streak: {
        count: streak.count,
        best_count: streak.best_count,
        last_active_date: streak.last_active_date,
      },
      studyLog: log  // Optionally return the updated study log
    });
  } catch (err) {
    console.error('Error updating streak:', err);
    res.status(500).json({ message: 'Server error updating streak' });
  }
}


};