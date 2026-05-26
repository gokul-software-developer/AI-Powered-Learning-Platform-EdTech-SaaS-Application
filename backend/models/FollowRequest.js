module.exports = (sequelize, DataTypes) => {
  const FollowRequest = sequelize.define("FollowRequest", {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId']
      }
    ]
  });


  FollowRequest.associate = models => {
  FollowRequest.belongsTo(models.User, { foreignKey: 'followerId', as: 'Follower' });
  FollowRequest.belongsTo(models.User, { foreignKey: 'followingId', as: 'Following' });
};

  return FollowRequest;
};