interface StudyLog {
  date: string; // ISO date string
  completed: boolean;
  minutesStudied?: number;
}

interface ActivePlan {
  study_time: number; // in minutes
}

interface StudyMetrics {
  todayTarget: number;
  todayStudied: number;
  todayProgress: number;
  currentStreak: number;
  bestStreak: number;
  last7Days: { date: string; studied: boolean; minutes: number }[];
  weeklyTotalMinutes: number;      // added
  weeklyDaysStudied: number;       // added
  weeklyAverage: number;           // added
}

export const calculateStudyMetrics = (
  activePlan: ActivePlan | null,
  studyLogs: StudyLog[],
  todayStudied: number
): StudyMetrics => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTarget = activePlan?.study_time ?? 0;
  const todayProgress = todayTarget > 0 ? Math.min((todayStudied / todayTarget) * 100, 100) : 0;

  const sortedLogs = [...studyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (logDate.getTime() === expectedDate.getTime() && sortedLogs[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  const chronologicalLogs = [...studyLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  chronologicalLogs.forEach(log => {
    if (log.completed) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Weekly stats
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const weekLogs = studyLogs.filter(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate >= weekStart && logDate <= today;
  });

  const weeklyTotalMinutes = weekLogs.reduce((sum, log) => sum + (log.minutesStudied ?? 0), 0);
  const weeklyDaysStudied = weekLogs.filter(log => log.completed).length;
  const weeklyAverage = weeklyDaysStudied > 0 ? Math.round(weeklyTotalMinutes / weeklyDaysStudied) : 0;

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const log = studyLogs.find(l => {
      const logDate = new Date(l.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    });

    last7Days.push({
      date: date.toLocaleDateString('en', { weekday: 'short' }),
      studied: log?.completed ?? false,
      minutes: log?.minutesStudied ?? 0,
    });
  }

  return {
    todayTarget,
    todayStudied,
    todayProgress,
    currentStreak,
    bestStreak,
    last7Days,
    weeklyTotalMinutes,   // return these new values
    weeklyDaysStudied,
    weeklyAverage,
  };
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getPlanStatus = (
  startDate: string,
  endDate: string
): 'upcoming' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
};
