module.exports = (sequelize, DataTypes) => {
  const GroupFile = sequelize.define('GroupFile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    file_name: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING, allowNull: false },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  GroupFile.associate = (models) => {
    GroupFile.belongsTo(models.Group, { foreignKey: 'group_id' });
    GroupFile.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return GroupFile;
};
