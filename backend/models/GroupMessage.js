// module.exports = (sequelize, DataTypes) => {
//   const GroupMessage = sequelize.define('GroupMessage', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     group_id: { type: DataTypes.INTEGER, allowNull: false },
//     sender_id: { type: DataTypes.INTEGER, allowNull: false },
//     message_text: { type: DataTypes.TEXT, allowNull: false }
//   });

//   GroupMessage.associate = (models) => {
//     GroupMessage.belongsTo(models.Group, { foreignKey: 'group_id' });
//     GroupMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
//   };

//   return GroupMessage;
// };
module.exports = (sequelize, DataTypes) => {
  const GroupMessage = sequelize.define('GroupMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isPdfLink: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });

  GroupMessage.associate = (models) => {
    GroupMessage.belongsTo(models.Group, { foreignKey: 'group_id' });
    GroupMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
  };

  return GroupMessage;
};
