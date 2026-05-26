const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/postgres');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.GoogleToken = require('./GoogleToken')(sequelize, DataTypes);
db.Course = require('./Course')(sequelize, DataTypes);
db.QuizScore = require('./QuizScore')(sequelize, DataTypes);
db.AssessmentScore = require('./AssessmentScore')(sequelize, DataTypes);
db.Streak = require('./Streak')(sequelize, DataTypes);
db.StudyPlan = require('./StudyPlan')(sequelize, DataTypes);
db.UserFeatures = require('./UserFeatures')(sequelize, DataTypes);
db.ToDoList = require('./ToDoList')(sequelize, DataTypes);
db.QuizAttempt = require('./QuizAttempt')(sequelize, DataTypes);
db.StudyProgress = require('./StudyProgress')(sequelize, DataTypes);
db.Group = require('./group')(sequelize, DataTypes);
db.GroupMember = require('./GroupMember')(sequelize, DataTypes);
db.GroupJoinRequest = require('./GroupJoinRequest')(sequelize, DataTypes);
db.GroupFile = require('./GroupFile')(sequelize, DataTypes);
db.GroupMessage = require('./GroupMessage')(sequelize, DataTypes);
db.NotionToken = require('./NotionToken')(sequelize, DataTypes);
db.Follow = require('./follow')(sequelize, DataTypes);
db.FollowRequest = require('./FollowRequest')(sequelize, DataTypes);
db.Videos = require('./Videos')(sequelize, DataTypes);
db.Keywords = require('./Keywords')(sequelize, DataTypes);
db.StudyLog = require('./StudyLog')(sequelize, DataTypes);
// Call associate methods on models that have them
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

module.exports = db;
