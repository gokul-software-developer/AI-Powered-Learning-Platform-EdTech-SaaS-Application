module.exports = (sequelize, DataTypes) => {
  const QuizScore = sequelize.define('QuizScore', {
    score: DataTypes.INTEGER,
  
    course_id_foreign_key: DataTypes.INTEGER,
  });

  QuizScore.associate = models => {
    QuizScore.belongsTo(models.Course, { foreignKey: 'course_id_foreign_key' });
    QuizScore.belongsTo(models.User, { foreignKey: 'user_id_foreign_key' });
  };

  return QuizScore;
};
