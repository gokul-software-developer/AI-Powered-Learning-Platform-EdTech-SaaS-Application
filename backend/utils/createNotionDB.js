const { Client } = require("@notionhq/client");
const { Videos, Course } = require('../models');  // Import Videos and Course models

async function createNotionDB(studyPlan, notionToken) {
  const notion = new Client({ auth: notionToken.access_token });

  // Create the study plan database
  const responseDB = await notion.databases.create({
    parent: { page_id: notionToken.parent_page_id },
    title: [{ type: "text", text: { content: studyPlan.plan_name } }],
    properties: {
      CourseName: { title: {} },
      StartDate: { date: {} },
      EndDate: { date: {} },
      DailyHours: { number: {} },
      StudyDays: { multi_select: { options: [] } },
      Notes: { rich_text: {} },
    },
  });

  const databaseId = responseDB.id;

  for (const courseId of studyPlan.course_ids) {
    // Fetch course details (implement as needed)
    const course = await Course.findByPk(courseId);
    const settings = studyPlan.course_settings[courseId] || {};

    // Create course page
    const coursePage = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        CourseName: {
          title: [{ text: { content: course?.title || `Course ${courseId}` } }],
        },
        StartDate: { date: { start: studyPlan.start_date } },
        EndDate: { date: { start: studyPlan.end_date } },
        DailyHours: { number: settings.daily_hours || 0 },
        StudyDays: {
          multi_select: (settings.study_days || []).map(day => ({ name: day })),
        },
        Notes: {
          rich_text: [{ text: { content: settings.notes || "" } }],
        },
      },
    });

    // Fetch videos for this course
    const videos = await Videos.findAll({ where: { course_id_foreign_key: courseId } });

    // Create a page for each video inside course page with just the video title
    for (const video of videos) {
      await notion.pages.create({
        parent: { page_id: coursePage.id },
        properties: {
          title: [
            { text: { content: video.video_title } }
          ],
        },
      });
    }
  }
}

module.exports = createNotionDB;
