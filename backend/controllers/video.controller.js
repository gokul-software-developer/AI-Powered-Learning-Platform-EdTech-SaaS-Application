const db = require('../models');
const { getTopVideoByEstimatedWatchTime } = require('../utils/topvideoSuggestion');
const Video = db.Videos; 

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.findAll();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const {course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ error: 'course_id' });
    }

    const topVideo = await getTopVideoByEstimatedWatchTime(keywords);

    if (!topVideo) {
      return res.status(404).json({ error: 'No relevant video found' });
    }

    const newVideo = await Video.create({
      video_title: topVideo.title,
      video_url: topVideo.url,
      video_thumbnail: topVideo.thumbnail,
      video_channel: topVideo.channel,
      video_duration: topVideo.duration,
      video_progress: false,
      course_id_foreign_key: course_id
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createIndididualVideo = async (req, res) => {
  try {
    const { video_title, video_url, video_thumbnail, video_channel, video_duration, course_id_foreign_key } = req.body;
    if (!video_title || !video_url || !video_thumbnail || !video_channel || !video_duration || !course_id_foreign_key) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newVideo = await Video.create({
      video_title,
      video_url,
      video_thumbnail,
      video_channel,
      video_duration,
      video_progress: false,
      course_id_foreign_key
    });
    res.status(201).json(newVideo); 
  } catch (error) {
    console.error('Error creating individual video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    await Video.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Video updated' });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    await Video.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Video deleted' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getVideosByCourseId = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const videos = await Video.findAll({
      where: { course_id_foreign_key: courseId }
    });

    if (videos.length === 0) {
      return res.status(404).json({ error: 'No videos found for this course' });
    }

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos by course ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateVideoProgress = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    if(video.video_progress === null) {
      video.video_progress = false;
    }
    video.video_progress = !video.video_progress;
    await video.save();

    res.json({ message: 'Video progress updated', video });
  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getTotalVideoProgress = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const videos = await Video.findAll({
      where: { course_id_foreign_key: courseId }
    });

    if (videos.length === 0) {
      return res.status(404).json({ error: 'No videos found for this course' });
    }

    const watchedVideos = videos.filter(video => video.video_progress);
    const videoCount = videos.length;


    res.json({ watchedVideos: watchedVideos.length, totalVideos: videoCount });
  } catch (error) {
    console.error('Error fetching total video progress:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}