// models/Follow.js
module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define("Follow", {
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

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'Follower' // user who follows
    });
    Follow.belongsTo(models.User, {
      foreignKey: 'followingId',
      as: 'Following' // user being followed
    });
  };

  return Follow;
};
