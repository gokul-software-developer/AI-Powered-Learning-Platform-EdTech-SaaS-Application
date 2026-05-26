// enroll.helper.js
const db = require('../models');
const Keyword = db.Keywords;
const Video = db.Videos;

async function enrollKeywordsAndVideos(courseId, courseCreatedId) {
  try {
    // 1. Fetch existing keywords and videos
    const keywords = await Keyword.findAll({
      where: { course_id_foreign_key: courseId }
    });

    const videos = await Video.findAll({
      where: { course_id_foreign_key: courseId }
    });

    if (!keywords || keywords.length === 0) {
      return { success: false, error: 'No keywords found for this course' };
    }

    if (!videos || videos.length === 0) {
      return { success: false, error: 'No videos found for this course' };
    }

    // 2. Prepare new keyword entries
    const keywordsData = keywords.map(keyword => ({
      keyword: keyword.keyword,
      course_id_foreign_key: courseCreatedId
    }));

    // 3. Prepare new video entries
    const videoData = videos.map(video => ({
      video_title: video.video_title,
      video_thumbnail: video.video_thumbnail,
      video_duration: video.video_duration,
      video_channel: video.video_channel,
      video_url: video.video_url,
      course_id_foreign_key: courseCreatedId,
      video_progress: false
    }));

    // 4. Bulk insert into database
    await Keyword.bulkCreate(keywordsData);
    await Video.bulkCreate(videoData);

    return { success: true, message: 'Keywords and videos enrolled successfully' };

  } catch (error) {
    console.error('Sequelize error during enrollment:', error);
    return { success: false, error: 'Database error during keyword/video enrollment' };
  }
}

module.exports = enrollKeywordsAndVideos;
