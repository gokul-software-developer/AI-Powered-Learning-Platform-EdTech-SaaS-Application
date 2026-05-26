module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    is_admin: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  GroupMember.associate = (models) => {
    GroupMember.belongsTo(models.Group, { foreignKey: 'group_id' });
    GroupMember.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return GroupMember;
};
