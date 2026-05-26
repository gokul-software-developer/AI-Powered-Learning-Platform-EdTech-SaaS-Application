module.exports = (sequelize, DataTypes) => {
  const StudyPlan = sequelize.define('StudyPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    weekdays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    study_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^([01]\d|2[0-3]):([0-5]\d)$/ // Validates "HH:mm"
      }
    },
    course_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    course_settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    course_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    save_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    google_event_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ref_study_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
   
  }, {
    tableName: 'StudyPlans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  StudyPlan.associate = function(models) {
    StudyPlan.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return StudyPlan;
};
