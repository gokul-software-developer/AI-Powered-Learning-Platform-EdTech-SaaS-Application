const { google } = require('googleapis');
const { oauth2Client } = require('../config/googlecalender');
const { User, CalendarEvent,GoogleToken, StudyPlan } = require('../models');
const { createGoogleCalendarEvent } = require('../utils/googlecal');
exports.getGoogleAuthUrl = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  res.json({ url });
};

exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });

  let returnUrl = 'http://localhost:5173/';
  let userId, planData;

  if (state) {
    try {
      const parsedState = JSON.parse(state);
      userId = parsedState.userId;
      planData = parsedState.planData;
      if (parsedState.returnUrl) returnUrl = parsedState.returnUrl;
    } catch (e) {
      console.error('Failed to parse state:', e);
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
  } else {
    return res.status(400).json({ error: 'Missing state parameter' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Save tokens
    await GoogleToken.upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });

    // Fetch user with tokens (to use Google Calendar API)
    const userWithTokens = await User.findByPk(userId, { include: ['googleToken'] });

    // Validate start_time fallback
    const validatedStartTime = planData.start_time && /^\d{2}:\d{2}$/.test(planData.start_time) ?
      planData.start_time : "09:00";

    // Create study plan in DB using planData (including start_time)
    const studyPlan = await StudyPlan.create({
      user_id: userId,
      plan_name: planData.plan_name,
      start_date: planData.start_date,
      end_date: planData.end_date,
      weekdays: planData.weekdays || [],
      study_time: planData.study_time,
      course_ids: planData.course_ids || [],
      course_settings: planData.course_settings || {},
      course_count: planData.course_ids ? planData.course_ids.length : 0,
      start_time: validatedStartTime,
    });

    // Prepare Google Calendar event details
    const mapDay = {
      Sunday: "SU",
      Monday: "MO",
      Tuesday: "TU",
      Wednesday: "WE",
      Thursday: "TH",
      Friday: "FR",
      Saturday: "SA",
    };
    const eventDays = (planData.weekdays || []).map(d => mapDay[d] || d.toUpperCase().slice(0, 2));

    const firstCourseId = Object.keys(planData.course_settings)[0];
    const start_time_str = validatedStartTime;
    const duration_minutes = planData.study_time;
    const startDateStr = new Date().toISOString().split("T")[0];
    const startDateTime = new Date(`${startDateStr}T${start_time_str}:00+05:30`);
    const endDateTime = new Date(startDateTime.getTime() + duration_minutes * 60 * 1000);

    const eventStartTime = startDateTime.toISOString().substring(11, 16);
    const eventEndTime = endDateTime.toISOString().substring(11, 16);

    const startDate = new Date(planData.start_date);
    const endDate = new Date(planData.end_date);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Create Google Calendar event
    const googleEventId = await createGoogleCalendarEvent(userWithTokens, {
      summary: `Study Plan: ${planData.plan_name}`,
      description: `Your study plan from ${planData.start_date} to ${planData.end_date}`,
      startTime: eventStartTime,
      endTime: eventEndTime,
      days: eventDays,
      durationInDays,
    });

    // Save Google event ID in study plan
    studyPlan.google_event_id = googleEventId;
    await studyPlan.save();

    // Redirect back to return URL
    return res.redirect(returnUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.status(500).send('OAuth error: ' + err.message);
  }
};



// exports.createEvent = async (req, res) => {
//   try {
//     const user = await User.findByPk(1);
//     if (!user?.google_tokens) return res.status(400).json({ error: 'Tokens missing' });

//     oauth2Client.setCredentials(user.google_tokens);
//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//     const { summary, description, startTime, endTime, days, durationInDays } = req.body;
//     const today = new Date();
//     const eventStart = new Date(`${today.toISOString().split('T')[0]}T${startTime}:00+05:30`);
//     const eventEnd = new Date(`${today.toISOString().split('T')[0]}T${endTime}:00+05:30`);
//     const until = new Date(today.setDate(today.getDate() + durationInDays))
//       .toISOString()
//       .replace(/[-:]/g, '')
//       .split('.')[0] + 'Z';

//     const recurrence = `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')};UNTIL=${until}`;

//     const response = await calendar.events.insert({
//       calendarId: 'primary',
//       resource: {
//         summary,
//         description,
//         start: { dateTime: eventStart.toISOString(), timeZone: 'Asia/Kolkata' },
//         end: { dateTime: eventEnd.toISOString(), timeZone: 'Asia/Kolkata' },
//         recurrence: [recurrence],
//       },
//     });

//     await CalendarEvent.create({
//       userId: user.id,
//       eventId: response.data.id,
//       summary,
//       description,
//       startTime,
//       endTime,
//       days,
//       durationInDays,
//     });

//     res.json({ eventId: response.data.id, message: 'Event created successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Create failed', details: err.message });
//   }
// };

// exports.updateEvent = async (req, res) => {
//   try {
//     const user = await User.findByPk(1);
//     if (!user?.google_tokens) return res.status(400).json({ error: 'Tokens missing' });

//     const { eventId } = req.params;
//     const { summary, description, startTime, endTime, days, durationInDays } = req.body;

//     oauth2Client.setCredentials(user.google_tokens);
//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//     const today = new Date();
//     const eventStart = new Date(`${today.toISOString().split('T')[0]}T${startTime}:00+05:30`);
//     const eventEnd = new Date(`${today.toISOString().split('T')[0]}T${endTime}:00+05:30`);
//     const until = new Date(today.setDate(today.getDate() + durationInDays))
//       .toISOString()
//       .replace(/[-:]/g, '')
//       .split('.')[0] + 'Z';
//     const recurrence = `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')};UNTIL=${until}`;

//     const updated = await calendar.events.update({
//       calendarId: 'primary',
//       eventId,
//       requestBody: {
//         summary,
//         description,
//         start: { dateTime: eventStart.toISOString(), timeZone: 'Asia/Kolkata' },
//         end: { dateTime: eventEnd.toISOString(), timeZone: 'Asia/Kolkata' },
//         recurrence: [recurrence],
//       },
//     });

//     await CalendarEvent.update(
//       { summary, description, startTime, endTime, days, durationInDays },
//       { where: { userId: user.id, eventId } }
//     );

//     res.json({ message: 'Event updated on Google Calendar and DB' });
//   } catch (err) {
//     res.status(500).json({ error: 'Update failed', details: err.message });
//   }
// };

// exports.deleteEvent = async (req, res) => {
//   try {
//     const user = await User.findByPk(1);
//     if (!user?.google_tokens) return res.status(400).json({ error: 'Tokens missing' });

//     const { eventId } = req.params;

//     oauth2Client.setCredentials(user.google_tokens);
//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//     await calendar.events.delete({ calendarId: 'primary', eventId });
//     await CalendarEvent.destroy({ where: { userId: user.id, eventId } });

//     res.json({ message: 'Event deleted from Google Calendar and DB' });
//   } catch (err) {
//     res.status(500).json({ error: 'Delete failed', details: err.message });
//   }
// };
