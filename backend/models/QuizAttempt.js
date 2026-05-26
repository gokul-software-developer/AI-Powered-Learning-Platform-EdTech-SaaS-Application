module.exports = (sequelize, DataTypes) => {
  const QuizAttempt = sequelize.define("QuizAttempt", {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    quiz_data: { type: DataTypes.JSON, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    score: { type: DataTypes.FLOAT, allowNull: true },
    passed: { type: DataTypes.BOOLEAN, allowNull: true }
  });
  QuizAttempt.associate = models => {
  QuizAttempt.belongsTo(models.User, { foreignKey: 'user_id' });
  QuizAttempt.belongsTo(models.Course, { foreignKey: 'course_id' });
};


  return QuizAttempt;
};
