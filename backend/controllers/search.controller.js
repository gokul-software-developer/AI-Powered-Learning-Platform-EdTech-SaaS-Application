const { Op } = require('sequelize');
const { User, Group, StudyPlan, Course } = require('../models');

exports.searchMulti = async (req, res) => {
  const query = req.query.query?.trim();

  if (!query) return res.status(400).json({ error: 'Search query is required' });

  try {
    const [users, groups, studyPlansRaw, coursesRaw] = await Promise.all([
      User.findAll({
        where: {
          [Op.or]: [
            { first_name: { [Op.iLike]: `%${query}%` } },
            { last_name: { [Op.iLike]: `%${query}%` } },
          ],
        },
        attributes: ['id', 'first_name', 'last_name'],
      }),

      Group.findAll({
        where: {
          group_name: { [Op.iLike]: `%${query}%` },
        },
        attributes: ['id', 'group_name'],
      }),

      // Include User (creator) with StudyPlan
      StudyPlan.findAll({
        where: {
          plan_name: { [Op.iLike]: `%${query}%` },
        },
        attributes: ['id', 'plan_name', 'user_id'],
        include: [{
          model: User,
          as: 'user',          // ensure alias matches your model definition
          attributes: ['id', 'first_name', 'last_name'],
        }],
      }),

      // Include User (creator) with Course
      Course.findAll({
        where: {
          course_name: { [Op.iLike]: `%${query}%` },
        },
        attributes: ['id', 'course_name', 'user_id_foreign_key'],
        include: [{
          model: User,
          as: 'user',          // ensure alias matches your model definition
          attributes: ['id', 'first_name', 'last_name'],
        }],
      }),
    ]);

    // Map studyPlans to include a 'createdBy' property
    const studyPlans = studyPlansRaw.map(sp => ({
      id: sp.id,
      plan_name: sp.plan_name,
      createdBy: sp.user ? `${sp.user.first_name} ${sp.user.last_name}`.trim() : null,
    }));

    // Map courses to include a 'createdBy' property
    const courses = coursesRaw.map(c => ({
      id: c.id,
      course_name: c.course_name,
      createdBy: c.user ? `${c.user.first_name} ${c.user.last_name}`.trim() : null,
    }));

    res.json({ users, groups, studyPlans, courses });
  } catch (error) {
    console.error('❌ Error in searchMulti:', error);
    res.status(500).json({ error: 'Search failed on server' });
  }
};
