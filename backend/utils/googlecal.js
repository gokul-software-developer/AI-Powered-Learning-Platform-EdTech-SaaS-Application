const { google } = require('googleapis');
const { CalendarEvent, User } = require('../models');
const { oauth2Client } = require('../config/googlecalender'); // Make sure this file exports configured oauth2Client

/**
 * Generate Google OAuth URL to initiate user consent.
 */
exports.getGoogleAuthUrl = (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',  // Needed to receive refresh token
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',       // Forces consent screen to allow new refresh token issuance
    });
    res.json({ url });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

/**
 * OAuth2 callback endpoint handler to exchange code for tokens and save them.
 */
exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code in query' });
  }

  let returnUrl = 'http://localhost:3000'; // Default fallback
  // Hardcode the userId:
  const userId = 1;

  try {
    // Best to still allow dynamic returnUrl from state
    if (state) {
      try {
        const parsedState = JSON.parse(state);
        if (parsedState.returnUrl) returnUrl = parsedState.returnUrl;
        // We ignore parsed userId and use userId = 1 hardcoded
      } catch (e) {
        console.error('Unable to parse state param:', state, e);
      }
    }

    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedGoogleTokens;
    if (tokens.refresh_token) {
      updatedGoogleTokens = tokens;
    } else {
      updatedGoogleTokens = {
        ...user.google_tokens,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
      };
    }

      // Upsert tokens for this user in the google_tokens table (1:1)
    await GoogleToken.upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });


    // Redirect back to page
    return res.redirect(returnUrl);

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.status(500).send('OAuth error: ' + err.message);
  }
};


/**
 * Create a recurring event on Google Calendar for a user.
 * User must have a valid googleToken association with necessary tokens.
 * 
 * @param {Object} user - Sequelize User instance with googleToken
 * @param {Object} eventData - Event details
 * @returns {Promise<string>} - Google Calendar event ID
 */
async function createGoogleCalendarEvent(user, { summary, description, startTime, endTime, days, durationDays }) {
  if (!user) throw new Error('User is required');
  if (!user.googleToken) throw new Error('User missing Google tokens');
  if (!startTime || !endTime) throw new Error('Start and end time required');
  if (!Array.isArray(days) || days.length === 0) throw new Error('Recurrence days required');
  if (typeof durationDays !== 'number' || durationDays <= 0) throw new Error('durationDays must be positive');

  try {
    oauth2Client.setCredentials({
      access_token: user.googleToken.access_token,
      refresh_token: user.googleToken.refresh_token,
      expiry_date: user.googleToken.expiry_date,
    });

    // Refresh token if expired
    await oauth2Client.getAccessToken();

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const todayStr = new Date().toISOString().split('T')[0];
    const eventStart = new Date(`${todayStr}T${startTime}:00+05:30`);
    const eventEnd = new Date(`${todayStr}T${endTime}:00+05:30`);

    if (eventStart >= eventEnd) throw new Error('Invalid event start and end times');

    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + durationDays);
    const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')};UNTIL=${untilStr}`;

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary,
        description,
        start: { dateTime: eventStart.toISOString(), timeZone: 'Asia/Kolkata' },
        end: { dateTime: eventEnd.toISOString(), timeZone: 'Asia/Kolkata' },
        recurrence: [recurrenceRule],
      }
    });

    if (!res.data?.id) throw new Error('Failed to create calendar event');

    console.log(`Created Google Calendar event with ID: ${res.data.id}`);

    return res.data.id;
  } catch (error) {
    console.error('Error in createGoogleCalendarEvent:', error);
    throw error;
  }
}



async function deleteGoogleCalendarEvent(user, eventId) {
  if (!user?.googleToken) {
    throw new Error('Google tokens missing');
  }

  oauth2Client.setCredentials({
    access_token: user.googleToken.access_token,
    refresh_token: user.googleToken.refresh_token,
    expiry_date: user.googleToken.expiry_date,
  });

  try {
    await oauth2Client.getAccessToken(); // refresh if needed

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    console.log(`Deleted Google Calendar event: ${eventId}`);
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
}


async function updateGoogleEvent(user, eventId, {
  summary,
  description,
  startTime,
  endTime,
  days,
  durationDays
}) {
  if (!user?.googleToken) {
    throw new Error('Google tokens missing for user');
  }
  if (!eventId) {
    throw new Error('Missing eventId to update');
  }
  if (!startTime || !endTime || !Array.isArray(days) || days.length === 0 || !durationDays) {
    throw new Error('Incomplete event details for updating Google Calendar event');
  }

  // Set OAuth credentials
  oauth2Client.setCredentials({
    access_token: user.googleToken.access_token,
    refresh_token: user.googleToken.refresh_token,
    expiry_date: user.googleToken.expiry_date,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Use current date as base for the event date (adjust as needed)
  const eventDateStr = new Date().toISOString().split('T')[0];

  // Construct Date objects for start and end times
  const startDateTime = new Date(`${eventDateStr}T${startTime}:00+05:30`);
  const endDateTime = new Date(`${eventDateStr}T${endTime}:00+05:30`);

  // Construct recurrence rule with UNTIL
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + durationDays);
  const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')};UNTIL=${untilStr}`;

  // Prepare the event resource patch
  const eventResource = {
    summary,
    description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    recurrence: [recurrenceRule],
  };

  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: eventResource,
    });

    if (!response || !response.data || !response.data.id) {
      throw new Error('Failed to update Google Calendar event: No event ID returned');
    }

    console.log(`Google Calendar event updated successfully. Event ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
}


 
module.exports = {
  deleteGoogleCalendarEvent,
  createGoogleCalendarEvent,
  updateGoogleEvent,
  getGoogleAuthUrl: exports.getGoogleAuthUrl,
  googleCallback: exports.googleCallback,
};
