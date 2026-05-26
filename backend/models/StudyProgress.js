// models/studyprogress.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudyProgress = sequelize.define('StudyProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    study_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    minutes_studied: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    target_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'StudyProgress',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  StudyProgress.associate = function(models) {
    // Associate with StudyPlan
    StudyProgress.belongsTo(models.StudyPlan, { foreignKey: 'plan_id' });
    
    // Associate with User if you have a User model
    // StudyProgress.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return StudyProgress;
};