module.exports = (sequelize, DataTypes) => {
  const GoogleToken = sequelize.define('GoogleToken', {
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.BIGINT, // unix timestamp in ms
      allowNull: true,
    },
    user_id: {                  // Optionally include FK here for clarity
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,             // Because one-to-one relationship is implied
    },
  }, {
    tableName: 'google_tokens',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  GoogleToken.associate = (models) => {
    GoogleToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return GoogleToken;
};
