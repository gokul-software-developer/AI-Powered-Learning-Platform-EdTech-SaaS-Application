const db = require('../models');
const Keywords = db.Keywords;

exports.getAllKeywords = async (req, res) => {
  try {
    const keywords = await Keywords.findAll();
    res.json(keywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getKeywordById = async (req, res) => {
  try {
    const keyword = await Keywords.findByPk(req.params.id);
    if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
    res.json(keyword);
  } catch (error) {
    console.error('Error fetching keyword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createKeyword = async (req, res) => {
  try {
    const newKeyword = await Keywords.create(req.body);
    res.status(201).json(newKeyword);
  } catch (error) {
    console.error('Error creating keyword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateKeyword = async (req, res) => {
  try {
    await Keywords.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Keyword updated' });
  } catch (error) {
    console.error('Error updating keyword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteKeyword = async (req, res) => {
  try {
    await Keywords.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Keyword deleted' });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getKeywordsByCourseId = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const keywords = await Keywords.findAll({
      where: { course_id_foreign_key: courseId }
    });

    if (keywords.length === 0) {
      return res.status(404).json({ error: 'No keywords found for this course' });
    }

    res.json(keywords);
  } catch (error) {
    console.error('Error fetching keywords by course ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


