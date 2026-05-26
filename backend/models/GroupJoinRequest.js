module.exports = (sequelize, DataTypes) => {
  const GroupJoinRequest = sequelize.define('GroupJoinRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    }
  });

  GroupJoinRequest.associate = (models) => {
    GroupJoinRequest.belongsTo(models.Group, { foreignKey: 'group_id' });
    GroupJoinRequest.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return GroupJoinRequest;
};
