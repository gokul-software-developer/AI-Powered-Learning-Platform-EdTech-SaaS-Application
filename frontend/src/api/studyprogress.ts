// // API Usage Examples for your frontend

// // ========================
// // 1. UPDATE TODAY'S PROGRESS
// // ========================

// // Update today's study minutes
// const updateTodayProgress = async (userId, minutesStudied, notes = '') => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/study-progress/today/${userId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           minutes_studied: minutesStudied,
//           notes: notes
//         })
//       });
      
//       const data = await response.json();
//       console.log('Today\'s progress updated:', data.progress);
//       return data.progress;
//     } catch (error) {
//       console.error('Error updating today\'s progress:', error);
//     }
//   };
  
//   // ========================
//   // 2. GET STREAK DATA
//   // ========================
  
//   // Get all streak information for dashboard
//   const getStreakData = async (userId) => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/study-progress/streaks/${userId}`);
//       const data = await response.json();
      
//       console.log('Streak Data:', {
//         currentStreak: data.currentStreak,
//         longestStreak: data.longestStreak,
//         monthlyGoal: data.monthlyGoal, // { target: 20, current: 12 }
//         todayProgress: data.todayProgress, // { studied: 45, target: 60 }
//         weeklyProgress: data.weeklyProgress // [{ date: 'Mon', studied: true }, ...]
//       });
      
//       return data;
//     } catch (error) {
//       console.error('Error fetching streak data:', error);
//     }
//   };
  
//   // ========================
//   // 3. SET USER PREFERENCES
//   // ========================
  
//   // Set daily target and monthly goal
//   const updateUserPreferences = async (userId, dailyTarget, monthlyGoal) => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/study-progress/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           daily_study_target: dailyTarget, // minutes
//           monthly_goal_days: monthlyGoal   // days
//         })
//       });
      
//       const data = await response.json();
//       console.log('Preferences updated:', data.preferences);
//       return data.preferences;
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//     }
//   };
  
//   // ========================
//   // 4. GET PROGRESS HISTORY
//   // ========================
  
//   // Get progress for a specific date range
//   const getProgressByDateRange = async (userId, startDate, endDate) => {
//     try {
//       const response = await fetch(
//         `http://localhost:3000/api/study-progress/range/${userId}?startDate=${startDate}&endDate=${endDate}`
//       );
//       const data = await response.json();
      
//       console.log('Progress history:', data.progress);
//       return data.progress;
//     } catch (error) {
//       console.error('Error fetching progress history:', error);
//     }
//   };
  
//   // ========================
//   // 5. EXAMPLE FRONTEND USAGE
//   // ========================
  
//   // Complete example for a study session component
//   const StudySessionExample = {
//     // When user starts studying
//     startStudySession: async (userId) => {
//       const todayProgress = await fetch(`http://localhost:3000/api/study-progress/today/${userId}`)
//         .then(res => res.json());
      
//       console.log('Current progress:', todayProgress.progress);
//       return todayProgress.progress;
//     },
  
//     // When user completes a study session
//     completeStudySession: async (userId, minutesStudied, notes) => {
//       // Update today's progress
//       const updatedProgress = await updateTodayProgress(userId, minutesStudied, notes);
      
//       // Get updated streak data
//       const streakData = await getStreakData(userId);
      
//       // Show success message with streak info
//       console.log(`Great job! You studied ${minutesStudied} minutes today.`);
//       console.log(`Current streak: ${streakData.currentStreak} days`);
      
//       return { progress: updatedProgress, streaks: streakData };
//     },
  
//     // Dashboard data
//     loadDashboard: async (userId) => {
//       const [streakData, todayProgress, preferences] = await Promise.all([
//         getStreakData(userId),
//         fetch(`http://localhost:3000/api/study-progress/today/${userId}`).then(res => res.json()),
//         fetch(`http://localhost:3000/api/study-progress/preferences/${userId}`).then(res => res.json())
//       ]);
  
//       return {
//         streaks: streakData,
//         today: todayProgress.progress,
//         preferences: preferences.preferences
//       };
//     }
//   };
  
//   // ========================
//   // 6. SAMPLE RESPONSES
//   // ========================
  
//   /* 
//   GET /api/study-progress/streaks/1 Response:
//   {
//     "currentStreak": 5,
//     "longestStreak": 12,
//     "monthlyGoal": {
//       "target": 20,
//       "current": 15
//     },
//     "todayProgress": {
//       "studied": 45,
//       "target": 60
//     },
//     "weeklyProgress": [
//       { "date": "Sun", "studied": false },
//       { "date": "Mon", "studied": true },
//       { "date": "Tue", "studied": true },
//       { "date": "Wed", "studied": false },
//       { "date": "Thu", "studied": true },
//       { "date": "Fri", "studied": true },
//       { "date": "Sat", "studied": true }
//     ]
//   }
//   */
  
//   /* 
//   PATCH /api/study-progress/today/1 Response:
//   {
//     "progress": {
//       "id": 15,
//       "user_id": 1,
//       "plan_id": null,
//       "study_date": "2025-06-27",
//       "minutes_studied": 60,
//       "target_minutes": 60,
//       "completed": true,
//       "notes": "Completed math and physics",
//       "created_at": "2025-06-27T10:30:00.000Z",
//       "updated_at": "2025-06-27T11:00:00.000Z"
//     }
//   }
//   */