module.exports = (sequelize, DataTypes) => {
  const StudyLog = sequelize.define(
    'StudyLog',
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY, // date only, no time
        allowNull: false,
      },
      minutesStudied: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // whether daily target was met
      },
    },
    {
      tableName: 'studylogs',
      timestamps: true,
    }
  );

  return StudyLog;
};