module.exports = (sequelize, DataTypes) => {
    const Videos = sequelize.define('Videos', {
      video_title: DataTypes.STRING,
      video_url: DataTypes.STRING,
      video_thumbnail: DataTypes.STRING,
      video_channel: DataTypes.STRING,
      video_duration: DataTypes.STRING,
      video_progress: DataTypes.BOOLEAN,

    course_id_foreign_key: DataTypes.INTEGER,
  });

  Videos.associate = models => {
    Videos.belongsTo(models.Course, { foreignKey: 'course_id_foreign_key' });
  };

  return Videos;
};

