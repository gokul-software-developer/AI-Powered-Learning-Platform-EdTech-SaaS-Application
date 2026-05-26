module.exports = (sequelize, DataTypes) => {
  const Streak = sequelize.define('Streak', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // one streak record per user
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    best_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_active_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    timestamps: true, // adds createdAt, updatedAt
    tableName: 'streaks',
  });

  return Streak;
};