const openai = require('../config/openai');
const db = require('../models');
const { fetchVideo } = require('./fetchVideo');
const Keywords = db.Keywords;

async function generateKeywords(courseName, courseId) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: `You are an expert curriculum planner. When given a course name or description, respond ONLY with a JSON object like this:

{
  "course": "Course Name",
  "topics": ["Topic 1", "Topic 2"]
}

Respond with 3–6 concise topics.`
        },
        {
          role: 'user',
          content: `Course: ${courseName}`
        }
      ],
      temperature: 0.3
    });

    const rawContent = response.choices[0].message.content;

    let topicsJson;
    try {
      topicsJson = JSON.parse(rawContent);
    } catch (err) {
      return { success: false, raw: rawContent, error: 'Failed to parse GPT response' };
    }

    const keywords = topicsJson.topics;
    const videoTitles = [];
    const videoUrls = [];
    const videoThumbnails = [];

    for (const keyword of keywords) {
      await Keywords.create({ keyword, course_id_foreign_key: courseId });

      const video = await fetchVideo(keyword, courseId);
      if (video?.success) {
        videoTitles.push(video.video.video_title);
        videoUrls.push(video.video.video_url);
        videoThumbnails.push(video.video.video_thumbnail);
      }
    }

    return {
      success: true,
      topics: keywords,
      videosGenerated: videoTitles,
      videoUrls,
      videoThumbnails,
    };
  } catch (err) {
    console.error('Error generating keywords or videos:', err);
    return { success: false, error: err.message };
  }
}

module.exports = generateKeywords;
