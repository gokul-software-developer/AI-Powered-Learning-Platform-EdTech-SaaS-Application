module.exports = (sequelize, DataTypes) => {
    const Keywords = sequelize.define('Keywords', {
      keyword: DataTypes.STRING,
      course_id_foreign_key: DataTypes.INTEGER,
    });
  
    Keywords.associate = models => {
      Keywords.belongsTo(models.Course, { foreignKey: 'course_id_foreign_key' });
    };
  
    return Keywords;
  };
  