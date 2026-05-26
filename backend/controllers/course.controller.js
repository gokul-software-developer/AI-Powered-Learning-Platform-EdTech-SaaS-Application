const { default: axios } = require('axios');
const db = require('../models');
const Course = db.Course; 
const Videos = db.Videos;
const Keywords = db.Keywords;
const generateKeywords = require('../utils/generateKeywords');
const enrollKeywordsAndVideos = require('../utils/enrollKeywordsAndVideos');
const { Op } = require('sequelize');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.createCourse = async (req, res) => {
//   try {
//     const newCourse = await Course.create(req.body);
//     res.status(201).json(newCourse);
//   } catch (error) {
//     console.error('Error creating course:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// } 

exports.updateCourse = async (req, res) => {
  try {
    await Course.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Course updated' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.createCourse = async (req, res) => {
//   const { course_name } = req.body;
//   const user_id_foreign_key = req.session.userId;
//   const ref_course_id = null;

//   if (!course_name || !user_id_foreign_key) {
//     return res.status(400).json({ error: 'course_name and user_id_foreign_key are required' });
//   }

//   try {
//     const newCourse = await Course.create({ course_name, user_id_foreign_key });

//     const result = await generateKeywords(course_name, newCourse.id);
//     if (!result.success) {
//       return res.status(201).json({
//         course: newCourse,
//         generatedTopics: [],
//         generatedVideos: [],
//         videoUrls: [],
//         keywordError: result.error || 'Unknown keyword generation error',
//         rawResponse: result.raw || null,
//       });
//     }

//     return res.status(201).json({
//       course: newCourse,
//       generatedTopics: result.topics,
//       generatedVideos: result.videosGenerated,
//       videoUrls: result.videoUrls || [],
//     });

//   } catch (error) {
//     console.error('❌ Error creating course and storing keywords:', error);
//     res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// };
exports.createCourse = async (req, res) => {
  const { course_name } = req.body;
  const user_id_foreign_key = req.session.userId;
  const ref_course_id = null;

  if (!course_name || !user_id_foreign_key) {
    return res.status(400).json({ error: 'course_name and user_id_foreign_key are required' });
  }

  try {
    // Count how many courses the user already owns
    const courseCount = await Course.count({ where: { user_id_foreign_key } });
    if (courseCount >= 5) {
      return res.status(403).json({ error: 'Course creation limit reached. You can only create up to 5 courses.' });
    }

    // Continue as before
    const newCourse = await Course.create({ course_name, user_id_foreign_key });

    const result = await generateKeywords(course_name, newCourse.id);
    if (!result.success) {
      return res.status(201).json({
        course: newCourse,
        generatedTopics: [],
        generatedVideos: [],
        videoUrls: [],
        keywordError: result.error || 'Unknown keyword generation error',
        rawResponse: result.raw || null,
      });
    }

    return res.status(201).json({
      course: newCourse,
      generatedTopics: result.topics,
      generatedVideos: result.videosGenerated,
      videoUrls: result.videoUrls || [],
    });

  } catch (error) {
    console.error('❌ Error creating course and storing keywords:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};



exports.deleteCourse = async (req, res) => {
  try {

    await Keywords.destroy({ where: { course_id_foreign_key: req.params.id } });
    await Videos.destroy({ where: { course_id_foreign_key: req.params.id } });
    await Course.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCoursesByUserId = async (req, res) => {
  // const userId = req.session?.userId || req.params.userId;
  // const userId = req.session?.userId;
  // console.log('Fetching courses for user ID:', req.session.cookie);

  const userId = req.session.userId;  // ✅ Use session userId
  console.log('Fetching courses for user ID:', userId);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized access: No session' });
  }
  
  try {
    const courses = await Course.findAll({
      where: { user_id_foreign_key: userId }
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by user ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.enrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.session.userId;

  if (!courseId || !userId) {
    return res.status(400).json({ error: 'courseId and userId are required' });
  }

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const CourseToEnroll = {
      user_id_foreign_key: userId,
      course_name: course.course_name,
      ref_course_id: course.id  
    };

    const courseCreated = await Course.create(CourseToEnroll);
    const result = await enrollKeywordsAndVideos(courseId, courseCreated.id);

    if (!result.success) {
      return res.status(500).json({
        error: result.error || 'Failed to enroll in course',
        rawResponse: result.raw || null
      });
    }

    res.json({ message: 'Successfully enrolled in the course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.searchCourses = async (req, res) => {
  const query = req.query.query || "";
  try {
    const courses = await Course.findAll({
      where: {
        course_name: {
          [Op.iLike]: `%${query}%`, // PostgreSQL (case-insensitive LIKE)
        },
      },
    });

    res.json(courses);
  } catch (error) {
    console.error("Error searching courses:", error);
    res.status(500).json({ error: "Server error while searching" });
  }
};

