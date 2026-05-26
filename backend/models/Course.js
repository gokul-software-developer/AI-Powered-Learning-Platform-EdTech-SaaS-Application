'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    course_name: DataTypes.STRING,
    user_id_foreign_key: DataTypes.INTEGER,
    ref_course_id: DataTypes.INTEGER,
    notion_template_db_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Course.associate = (models) => {
    // Associate Course with User as 'user'
    Course.belongsTo(models.User, {
      foreignKey: 'user_id_foreign_key',
      as: 'user'
    });

    Course.hasMany(models.Videos, {
      foreignKey: 'course_id_foreign_key'
    });

    Course.hasMany(models.Keywords, {
      foreignKey: 'course_id_foreign_key'
    });

    Course.hasMany(models.QuizScore, {
      foreignKey: 'course_id_foreign_key'
    });

    Course.hasMany(models.AssessmentScore, {
      foreignKey: 'course_id_foreign_key'
    });
  };

  return Course;
};
