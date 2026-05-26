module.exports = (sequelize, DataTypes) => {
  const UserProgress = sequelize.define('UserProgress', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    
    item_type: {
      type: DataTypes.ENUM('video', 'quiz','exam'),
      allowNull: false,
    },

    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },

    item_name: {
      type: DataTypes.STRING,
      allowNull: true, 
    },

    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: true, 
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  UserProgress.associate = models => {
    UserProgress.belongsTo(models.User, { foreignKey: 'user_id' });
    UserProgress.belongsTo(models.Course, { foreignKey: 'course_id' });
  };

  return UserProgress;
};
