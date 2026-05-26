module.exports = (sequelize, DataTypes) => {
  const NotionToken = sequelize.define('NotionToken', {
    user_id_foreign_key: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workspace_id: DataTypes.STRING,
    workspace_name: DataTypes.STRING,
    bot_id: DataTypes.STRING,
    notion_user_id: DataTypes.STRING,
    parent_page_id: DataTypes.STRING,
    access_token: DataTypes.STRING,        // <--- add this back
    refresh_token: DataTypes.STRING,       // <--- optional
    access_token_expires_at: DataTypes.DATE // <--- optional
  });

  NotionToken.associate = models => {
    NotionToken.belongsTo(models.User, { foreignKey: 'user_id_foreign_key' });
  };

  return NotionToken;
};
