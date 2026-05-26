module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    group_name: {
      type: DataTypes.STRING,
      allowNull: false, // ❗ make this required
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false, // ❗ now enforce NOT NULL after cleanup
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    join_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Group.associate = (models) => {
    Group.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Group.hasMany(models.GroupMember, { foreignKey: 'group_id' });
    Group.hasMany(models.GroupJoinRequest, { foreignKey: 'group_id' });
    Group.hasMany(models.GroupMessage, { foreignKey: 'group_id' });
    Group.hasMany(models.GroupFile, { foreignKey: 'group_id' });
  };

  return Group;
};
