// controllers/studyPlanController.js

const { StudyPlan, StudyProgress, User, Course } = require('../models');
const { createGoogleCalendarEvent,updateGoogleCalendarEvent, deleteGoogleCalendarEvent } = require('../utils/googlecal');
const { oauth2Client } = require('../config/googlecalender');

const studyPlanController = {

  // GET /api/study-plans?userId=1 : Get all study plans for user
  getAllStudyPlans: async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const studyPlans = await StudyPlan.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      res.json({ studyPlans });

    } catch (error) {
      console.error('Error fetching study plans:', error);
      res.status(500).json({ error: 'Failed to fetch study plans' });
    }
  },

  // POST /api/study-plans : Create a new study plan with Google sync option




createStudyPlan: async (req, res) => {
  try {
    console.log("Received createStudyPlan request with body:", JSON.stringify(req.body, null, 2));

    const {
      user_id,
      plan_name,
      start_date,
      end_date,
      weekdays,
      study_time,
      course_ids,
      course_settings,
      start_time,
    } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("User found:", user.id);
    const shouldSync = !!user.sync_with_google;
    console.log("User sync_with_google:", shouldSync);

    // -- Validation omitted for brevity (keep your validations here) --

    if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
      return res.status(400).json({ error: "start_time must be in HH:mm format" });
    }

    // Fetch user tokens early for sync decision and use
    const userWithTokens = await User.findByPk(user_id, { include: ['googleToken'] });

    // If user wants Google sync but no token, start OAuth and defer creation
    if (shouldSync && (!userWithTokens || !userWithTokens.googleToken)) {
      const statePayload = JSON.stringify({
        userId: user_id,
        planData: req.body,
        returnUrl: req.body.returnUrl || undefined,
      });

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent', // Helps get refresh token for new users
        state: statePayload,
      });

      console.log("User missing tokens, redirecting to consent");
      return res.status(401).json({
        error: "Connect Google to enable calendar sync",
        googleAuthUrl: authUrl,
      });
    }

    // Create the study plan in DB
    const studyPlan = await StudyPlan.create({
      user_id,
      plan_name,
      start_date,
      end_date,
      weekdays: weekdays || [],
      study_time,
      course_ids: course_ids || [],
      course_settings: course_settings || {},
      course_count: course_ids ? course_ids.length : 0,
      start_time,
    });

    console.log("Study plan persisted:", studyPlan.id);

    // If syncing is enabled and user tokens exist, sync calendar event
    if (shouldSync) {
      try {
        const mapDay = {
          Sunday: 'SU', Monday: 'MO', Tuesday: 'TU', Wednesday: 'WE',
          Thursday: 'TH', Friday: 'FR', Saturday: 'SA'
        };

        const allStudyDays = Array.from(new Set(Object.values(course_settings)
          .flatMap(s => s.study_days || [])
        ));

        const eventDays = allStudyDays.map(d => mapDay[d] || d.toUpperCase().slice(0, 2));

        let eventStartTime = start_time;
        if (!eventStartTime) {
          // fallback to earliest start_time among courses
          const times = Object.values(course_settings).map(s => s.start_time).filter(Boolean);
          if (times.length) eventStartTime = times.reduce((a, b) => a < b ? a : b);
          else eventStartTime = "09:00";
        }

        const durationMinutes = typeof study_time === 'number' && study_time > 0 ? study_time : 60;

        const [startH, startM] = eventStartTime.split(':').map(Number);
        let endH = startH + Math.floor(durationMinutes / 60);
        let endM = startM + (durationMinutes % 60);
        if (endM >= 60) { endH += 1; endM -= 60; }
        endH %= 24;
        const eventEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        const eventSummary = `Study Plan: ${plan_name}`;
        const eventDescription = `Study plan from ${start_date} to ${end_date} with courses: ${course_ids?.join(", ") || "None"}`;

        const google_event_id = await createGoogleCalendarEvent(userWithTokens, {
          summary: eventSummary,
          description: eventDescription,
          startTime: eventStartTime,
          endTime: eventEndTime,
          days: eventDays,
          durationDays: Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1,
        });

        studyPlan.google_event_id = google_event_id;
        await studyPlan.save();
        console.log("Google event synced with ID:", google_event_id);
      } catch (err) {
        console.error("Google sync error:", err);
        // Do not block API response on sync failure
      }
    }

    return res.status(201).json({ studyPlan });

  } catch (error) {
    console.error("Error in createStudyPlan:", error);
    return res.status(500).json({ error: "Failed to create study plan" });
  }
},







  // GET /api/study-plans/:id
getStudyPlanById: async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    const planId = Number(id);
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid study plan ID' });
    }

    const studyPlan = await StudyPlan.findOne({
      where: {
        id: planId,
        user_id: userId  // Correct foreign key field name
      }
    });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found or access denied' });
    }

    return res.json(studyPlan);

  } catch (error) {
    console.error('Error fetching study plan:', error);
    return res.status(500).json({ error: 'Internal server error fetching study plan' });
  }
}

,

  // PUT /api/study-plans/:id - Update study plan
updateStudyPlan : async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plan_name,
      start_date,
      end_date,
      weekdays,
      study_time,
      course_ids,
      course_settings,
      start_time,
      sync_with_google,
    } = req.body;

    // Fetch the study plan
    const studyPlan = await StudyPlan.findByPk(id);
    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    // Validations
    if (course_ids && course_ids.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 courses allowed per study plan' });
    }
    if (weekdays && !Array.isArray(weekdays)) {
      return res.status(400).json({ error: 'weekdays must be an array' });
    }
    if (start_date && end_date) {
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      if (startDateObj >= endDateObj) {
        return res.status(400).json({ error: 'end_date must be after start_date' });
      }
    }
    if (start_time !== undefined && !/^\d{2}:\d{2}$/.test(start_time)) {
      return res.status(400).json({ error: 'start_time must be in HH:mm format' });
    }

    // Update Study Plan
    await studyPlan.update({
      plan_name: plan_name !== undefined ? plan_name : studyPlan.plan_name,
      start_date: start_date !== undefined ? start_date : studyPlan.start_date,
      end_date: end_date !== undefined ? end_date : studyPlan.end_date,
      weekdays: weekdays !== undefined ? weekdays : studyPlan.weekdays,
      study_time: study_time !== undefined ? study_time : studyPlan.study_time,
      course_ids: course_ids !== undefined ? course_ids : studyPlan.course_ids,
      course_settings: course_settings !== undefined ? course_settings : studyPlan.course_settings,
      course_count: course_ids ? course_ids.length : studyPlan.course_count,
      start_time: start_time !== undefined ? start_time : studyPlan.start_time,
      sync_with_google: sync_with_google !== undefined ? sync_with_google : studyPlan.sync_with_google,
    });

    // Google Calendar Sync
    if (studyPlan.sync_with_google) {
      const user = await User.findByPk(studyPlan.user_id, { include: ['googleToken'] });
      if (!user?.googleToken) {
        console.warn(`Google tokens missing for user ${studyPlan.user_id}. Skipping calendar sync.`);
      } else {
        try {
          // Map weekdays for recurrence
          const mapDay = {
            Sunday: "SU",
            Monday: "MO",
            Tuesday: "TU",
            Wednesday: "WE",
            Thursday: "TH",
            Friday: "FR",
            Saturday: "SA",
          };

          // Aggregate unique study days across all courses
          const allDaysSet = new Set();
          Object.values(studyPlan.course_settings).forEach(c => {
            c.study_days.forEach(day => allDaysSet.add(day));
          });
          const allDays = Array.from(allDaysSet);
          const eventDays = allDays.map(d => mapDay[d] || d.slice(0, 2).toUpperCase());

          // Determine start_time for event
          let eventStartTime = studyPlan.start_time;
          if (!eventStartTime) {
            const courseTimes = Object.values(studyPlan.course_settings).map(c => c.start_time).filter(Boolean);
            eventStartTime = courseTimes.length ? courseTimes.sort()[0] : "09:00";
          }

          // Calculate end time
          const durationInMinutes = studyPlan.study_time || 60;
          const [startH, startM] = eventStartTime.split(":").map(Number);
          let endHour = startH + Math.floor(durationInMinutes / 60);
          let endMin = startM + (durationInMinutes % 60);
          if (endMin >= 60) {
            endHour += 1;
            endMin -= 60;
          }
          endHour %= 24;
          const eventEndTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

          // Dates for recurrence rule
          const startDateObj = new Date(studyPlan.start_date);
          const endDateObj = new Date(studyPlan.end_date);
          const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

          // Assemble event details
          const eventSummary = `Study Plan: ${studyPlan.plan_name}`;
          const eventDescription = `Study plan from ${studyPlan.start_date} to ${studyPlan.end_date} with courses: ${studyPlan.course_ids.join(', ')}`;

          // Update or create event
          if (studyPlan.google_event_id) {
            // You need to implement updateGoogleCalendarEvent
            const updatedEventId = await updateGoogleCalendarEvent(user, studyPlan.google_event_id, {
              summary: eventSummary,
              description: eventDescription,
              startTime: eventStartTime,
              endTime: eventEndTime,
              days: eventDays,
              durationInDays: durationDays,
            });
            studyPlan.google_event_id = updatedEventId || studyPlan.google_event_id;
            await studyPlan.save();
            console.log(`Updated Google Calendar event with ID: ${updatedEventId}`);
          } else {
            const newEventId = await createGoogleCalendarEvent(user, {
              summary: eventSummary,
              description: eventDescription,
              startTime: eventStartTime,
              endTime: eventEndTime,
              days: eventDays,
              durationInDays: durationDays,
            });
            studyPlan.google_event_id = newEventId;
            await studyPlan.save();
            console.log(`Created Google Calendar event with ID: ${newEventId}`);
          }

        } catch (syncErr) {
          console.error("Google Calendar sync failed: ", syncErr);
          // Don't fail the update operation due to calendar issues.
        }
      }
    }

    return res.json({ studyPlan });
  } catch (err) {
    console.error("Failed to update study plan:", err);
    return res.status(500).json({ error: "Failed to update study plan" });
  }
},

  // DELETE /api/study-plans/:id
 
deleteStudyPlan : async (req, res) => {
  try {
    const { id } = req.params;

    const studyPlan = await StudyPlan.findByPk(id);
    if (!studyPlan) return res.status(404).json({ error: "Study plan not found" });

    if (studyPlan.google_event_id) {
      const user = await User.findByPk(studyPlan.user_id, { include: ['googleToken'] });

      if (!user || !user.googleToken) {
        console.warn(`User ${studyPlan.user_id} has no valid Google tokens.`);
      } else {
        try {
          await deleteGoogleCalendarEvent(user, studyPlan.google_event_id);
          console.log(`Deleted Google event: ${studyPlan.google_event_id}`);
        } catch (err) {
          console.error("Failed to delete Google event:", err);
          // Decide: continue deletion or halt? Current: continue
        }
      }
    }

    await studyPlan.destroy();

    return res.json({ message: "Study plan and Google event deleted successfully" });

  } catch (error) {
    console.error("Error deleting study plan:", error);
    return res.status(500).json({ error: "Failed to delete study plan" });
  }
},



  // GET /api/study-plans/:id/progress - Get progress for a study plan
  getStudyProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 30 } = req.query;

      const progress = await StudyProgress.findAll({
        where: { plan_id: id },
        order: [['study_date', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({ progress });

    } catch (error) {
      console.error('Error fetching study progress for plan:', error);
      res.status(500).json({ error: 'Failed to fetch study progress for plan' });
    }
  },

  // GET /api/users/:userId/registered-courses - Get courses registered by user
  getRegisteredCourses: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const courses = await Course.findAll({
        attributes: ['id', 'course_name', 'createdAt', 'updatedAt'],
        where: { user_id_foreign_key: userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({ courses });

    } catch (error) {
      console.error('Error fetching registered courses:', error);
      res.status(500).json({ error: 'Failed to fetch registered courses' });
    }
  },

  // GET /api/study-plans/user/:userId - Get study plans with course details
  getStudyPlansByUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const studyPlans = await StudyPlan.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      const studyPlansWithCourses = await Promise.all(
        studyPlans.map(async (plan) => {
          const planData = plan.toJSON();

          if (planData.course_ids && planData.course_ids.length > 0) {
            const courseDetails = await Course.findAll({
              where: { id: planData.course_ids },
              attributes: ['id', 'course_name', 'description', 'duration_weeks']
            });
            planData.course_details = courseDetails;
          }

          return planData;
        })
      );

      res.json({ studyPlans: studyPlansWithCourses });

    } catch (error) {
      console.error('Error fetching study plans with courses:', error);
      res.status(500).json({ error: 'Failed to fetch study plans with courses' });
    }
  },


  // GET /api/study-plans/:id/course-progress
getStudyPlanVideoProgress: async (req, res) => {
  try {
    const { id } = req.params; // planId
    const plan = await StudyPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ error: 'Study Plan not found' });
    }

    console.log('plan.course_ids:', plan.course_ids);
    console.log('plan.course_settings:', plan.course_settings);

    const courseIds = Array.isArray(plan.course_ids) ? plan.course_ids : JSON.parse(plan.course_ids);
    const courseSettings = typeof plan.course_settings === 'object' 
      ? plan.course_settings 
      : JSON.parse(plan.course_settings);

    const courses = await Course.findAll({
      where: { id: courseIds },
      include: { association: 'Videos' } // Make sure your model associations are set
    });

    const result = courses.map(course => {
      const videos = course.Videos || [];
      const watched = videos.filter(video => video.video_progress).length;
      const total = videos.length;

      return {
        courseId: course.id,
        courseName: course.course_name,
        totalVideos: total,
        watchedVideos: watched,
        settings: courseSettings[course.id] || {}
      };
    });

    res.json({ planName: plan.plan_name, progress: result });
  } catch (error) {
    console.error('Error fetching study plan video progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
},

  // GET /api/study-plans/:id/with-courses - Get single study plan with full course details
  getStudyPlanWithCourses: async (req, res) => {
    try {
      const { id } = req.params;

      const studyPlan = await StudyPlan.findByPk(id);

      if (!studyPlan) {
        return res.status(404).json({ error: 'Study plan not found' });
      }

      const planData = studyPlan.toJSON();

      if (planData.course_ids && planData.course_ids.length > 0) {
        const courseDetails = await Course.findAll({
          where: { id: planData.course_ids },
          attributes: [
            'id',
            'course_name',
            'user_id_foreign_key',
            'ref_course_id',
            'notion_template_db_id'
          ]
        });

        planData.course_details = courseDetails;
      }

      res.json({ studyPlan: planData });

    } catch (error) {
      console.error('Error fetching study plan with courses:', error);
      res.status(500).json({ error: 'Failed to fetch study plan with courses' });
    }
  }

};

module.exports = studyPlanController;
// if google not opted created plan stores in db 
//if google opted && tokens exist  then the event gets created in db and google cal and with the google calender event id in study plan model
//if google opted &&tokens do not exist then return 401 with google auth url  then it get authenticated and the creation of eevnt is directed to 
//it, so the first time they authtenticate istelf it will be used.
