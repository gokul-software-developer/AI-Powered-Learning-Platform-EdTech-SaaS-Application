const db = require('../models');
const { getTopVideoByEstimatedWatchTime } = require('./topvideoSuggestion');
const Video = db.Videos;

async function fetchVideo(keyword, courseId) {

  try {

    const topVideo = await getTopVideoByEstimatedWatchTime(keyword);

    if(!topVideo) {
      return { success: false, message: `No relevant video found for keyword ${keyword}` };
    }

    const videoData = {
      video_title : topVideo.title,
      video_url : topVideo.url,
      video_thumbnail : topVideo.thumbnail,
      video_channel : topVideo.channel,
      video_duration : topVideo.duration,
      video_progress: false,
      course_id_foreign_key: courseId
    };

    const newVideo = await Video.create(videoData)

    return {
      success: true,
      video: newVideo
    };
  }
  catch (error) {
    console.error('Error fetching video:', error);
    return { success: false, message: `error storing video for keyword : ${keyword}` };
  }
}

module.exports = { fetchVideo };