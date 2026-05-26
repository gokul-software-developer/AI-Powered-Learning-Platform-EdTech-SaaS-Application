const { User, Course, QuizAttempt } = require('../models');
const generateCertificate = require('../utils/certificateGenerator'); // this will return a PDF buffer

exports.getCertificate = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.session.userId;
  try {
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);

    if (!user || !course) {
      return res.status(404).json({ error: 'User or course not found' });
    }

    const quiz = await QuizAttempt.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!quiz) {
      return res.status(400).json({ error: 'Complete the quiz to receive a certificate' });
    }

    if (!quiz.passed) {
      return res.status(403).json({ error: 'You must pass the quiz to get the certificate' });
    }

    // 🧠 Generate the PDF certificate in memory
    const pdfBuffer = await generateCertificate(user, course, quiz.date); // <-- this must return Buffer

    // 📤 Stream PDF directly to user (no file saved)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${course.course_name}_Certificate.pdf"`);
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Certificate generation failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
