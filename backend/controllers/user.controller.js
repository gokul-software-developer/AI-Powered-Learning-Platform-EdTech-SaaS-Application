const User = require('../models/User');

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updated = await User.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'User updated', updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed', details: err.message });
  }
};
