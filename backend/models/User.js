// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING(50),
    last_name: DataTypes.STRING(50),
    mobile: DataTypes.STRING(10),
    password: DataTypes.STRING(255),
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    following_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sync_with_notion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sync_with_google: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  User.associate = (models) => {
    // Other associations
    User.hasMany(models.Course, { foreignKey: 'user_id_foreign_key' });
    User.hasMany(models.Streak, { foreignKey: 'user_id' });
    User.hasMany(models.StudyPlan, { foreignKey: 'user_id' });
    User.hasMany(models.QuizScore, { foreignKey: 'user_id_foreign_key' });
    User.hasMany(models.AssessmentScore, { foreignKey: 'user_id_foreign_key' });
    User.hasMany(models.ToDoList, { foreignKey: 'user_id_foreign_key' });

    // Follow relationships (follower/following)
    User.hasMany(models.Follow, {
      foreignKey: 'followerId',
      as: 'Followings' // users THIS user is following
    });
    User.hasMany(models.Follow, {
      foreignKey: 'followingId',
      as: 'Followers' // users FOLLOWING this user
    });

    // For direct User-to-User query of followers/followings
    User.belongsToMany(models.User, {
      through: models.Follow,
      as: 'UserFollowers',   // Users who follow THIS user
      foreignKey: 'followingId',
      otherKey: 'followerId'
    });
    User.belongsToMany(models.User, {
      through: models.Follow,
      as: 'UserFollowings',  // Users THIS user is following
      foreignKey: 'followerId',
      otherKey: 'followingId'
    });

    // One-to-one with GoogleToken
    User.hasOne(models.GoogleToken, {
      foreignKey: 'user_id',
      as: 'googleToken',
    });
  };

  return User;
};
