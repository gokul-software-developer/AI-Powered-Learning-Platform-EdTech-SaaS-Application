module.exports = (sequelize, DataTypes) => {
  const AssessmentScore = sequelize.define('AssessmentScore', {
    score: DataTypes.INTEGER,
  
    course_id_foreign_key: DataTypes.INTEGER,
    user_id_foreign_key: DataTypes.INTEGER,  // Add the correct foreign key for the user
  });

  AssessmentScore.associate = models => {
    AssessmentScore.belongsTo(models.Course, { foreignKey: 'course_id_foreign_key' });
    AssessmentScore.belongsTo(models.User, { foreignKey: 'user_id_foreign_key' }); // Make sure foreign key matches the model column
  };

  return AssessmentScore;
};
