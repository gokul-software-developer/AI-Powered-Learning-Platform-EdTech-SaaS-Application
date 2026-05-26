import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Trophy, Clock, Target, Calendar, TrendingUp } from 'lucide-react';

interface StudyPlan {
  id: number;
  plan_name: string;
  study_time: number;   // daily target minutes
  start_date: string;
  end_date: string;
  weekdays: string[];
}

interface DayMetric {
  date: string;
  studied: boolean;
  minutesStudied?: number;
}

interface MetricsType {
  todayStudied: number;
  todayTarget: number;
  todayProgress: number; // 0-100
  currentStreak: number;
  bestStreak: number;
  weeklyTotalMinutes: number;
  weeklyDaysStudied: number;
  weeklyAverage: number;
  last7Days: DayMetric[];
}

interface StudyProgressProps {
  userId: number;
  activePlan: StudyPlan | null;
  targetStudyTime?: number; // override the plan's study time
}

const StudyProgress: React.FC<StudyProgressProps> = ({ userId, activePlan, targetStudyTime }) => {
  // Choose target time in order: prop -> plan -> default 60
  const initialTarget = targetStudyTime || activePlan?.study_time || 60;

  const [metrics, setMetrics] = useState<MetricsType>({
    todayStudied: 0,
    todayTarget: initialTarget,
    todayProgress: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyTotalMinutes: 0,
    weeklyDaysStudied: 0,
    weeklyAverage: 0,
    last7Days: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const todayDateString = new Date().toISOString().slice(0, 10);

  const calcWeeklyStats = (logs: DayMetric[]) => {
    const totalMinutes = logs.reduce((sum, day) => sum + (day.minutesStudied || 0), 0);
    const daysStudied = logs.filter(day => day.studied).length;
    const average = daysStudied > 0 ? Math.round(totalMinutes / daysStudied) : 0;
    return { totalMinutes, daysStudied, average };
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:3000/api/streak/${userId}`);

      const streakData = res.data.streak || {};
      const todayStudyData = res.data.todayStudy || { minutesStudied: 0, completed: false };
      const last7DaysRaw = res.data.last7Days || [];

      const last7Days = last7DaysRaw.map((day: any) => ({
        date: day.date,
        studied: day.studied,
        minutesStudied: day.minutesStudied || 0,
      }));

      const todayStudied = todayStudyData.minutesStudied || 0;
      const { totalMinutes, daysStudied, average } = calcWeeklyStats(last7Days);

      const todayTarget = targetStudyTime || activePlan?.study_time || 60;
      const todayProgress = todayTarget > 0 ? Math.min((todayStudied / todayTarget) * 100, 100) : 0;

      setMetrics({
        todayStudied,
        todayTarget,
        todayProgress,
        currentStreak: streakData.count || 0,
        bestStreak: streakData.best_count || 0,
        weeklyTotalMinutes: totalMinutes,
        weeklyDaysStudied: daysStudied,
        weeklyAverage: average,
        last7Days,
      });
    } catch (err: any) {
      setError('Failed to fetch progress data');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMetrics();
    }
  }, [userId, activePlan, targetStudyTime]); // added targetStudyTime

  const openModal = () => {
    setMinutes('');
    setShowModal(true);
  };

  const closeModal = () => {
    setMinutes('');
    setShowModal(false);
  };

  const handleSubmit = async () => {
    const minsNum = parseInt(minutes.trim(), 10);
    if (isNaN(minsNum) || minsNum <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const today = todayDateString;
      const target = targetStudyTime || activePlan?.study_time || 60;
      const completed = minsNum >= target;

      await axios.post(`http://localhost:3000/api/streak/${userId}`, {
        date: today,
        completed,
        minutesStudied: minsNum,
      });

      await fetchMetrics();
      closeModal();
    } catch (err: any) {
      setError('Failed to log study session');
      console.error('Error logging study session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6 bg-gray shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row items-center justify-between text-lg md:text-xl">
            <div className="flex items-center mb-2 md:mb-0">
              <TrendingUp className="w-5 h-5 mr-2" />
              Your Progress
            </div>
            {activePlan && (
              <button
                onClick={openModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                + Log Study Time
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-gray-500">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {activePlan ? (
            <div className="bg-gray shadow-lg rounded-lg p-6 mb-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  Today's Goal - {activePlan.plan_name}
                </h3>
                <div className="flex justify-center text-gray-600 text-sm mb-2">
                  <span className="font-mono">
                    {metrics.todayStudied} min / {metrics.todayTarget} min
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 rounded-full h-3 transition-all duration-300"
                    style={{ width: `${metrics.todayProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.todayProgress >= 100
                    ? '🎉 Goal completed!'
                    : `${Math.round(metrics.todayProgress)}% complete`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray shadow-lg rounded-lg p-6 mb-4 text-center">
              <p className="text-gray-600">No active study plan. Create one to track your progress!</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray shadow-lg rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Streak</p>
                    <p className="text-2xl font-bold">{metrics.currentStreak}d</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Best</p>
                    <p className="text-xl font-medium">{metrics.bestStreak}d</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray shadow-lg rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium">This Week</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Time:</span>
                  <span className="font-medium">
                    {Math.floor(metrics.weeklyTotalMinutes / 60)}h {metrics.weeklyTotalMinutes % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Studied:</span>
                  <span className="font-medium">{metrics.weeklyDaysStudied}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Average:</span>
                  <span className="font-medium">{metrics.weeklyAverage}min</span>
                </div>
              </div>
            </div>

            <div className="bg-gray shadow-lg rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Monthly Goal
                </h3>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min((metrics.weeklyDaysStudied / 20) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-center">
                {Math.round((metrics.weeklyDaysStudied / 20) * 100)}% of monthly goal achieved
              </p>
            </div>
          </div>

          {/* Last 7 days */}
          <div className="bg-gray shadow-lg rounded-lg p-6">
            <h3 className="font-medium mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Last 7 Days
            </h3>
            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
              {metrics.last7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center flex-shrink-0 w-1/7">
                  <div
                    className={`${
                      day.studied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    } w-8 h-8 flex items-center justify-center rounded-full mb-1 text-xs font-medium`}
                  >
                    {day.studied ? '✓' : '○'}
                  </div>
                  <span className="text-xs text-gray-600">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Log Study Minutes</h2>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="Enter minutes studied"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Log Time
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudyProgress;