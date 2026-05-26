module.exports = (sequelize, DataTypes) => {
  const UserFeatures = sequelize.define('UserFeatures', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Automatically increments
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // table name, not model name
        key: 'id',
      },
      onDelete: 'CASCADE', // Delete UserFeatures if User is deleted
    },
    selected_features: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // To store an array of text
      allowNull: false,
    },
    
  }, {
    // Define table-level options
    // tableName: 'UserFeatures',
    timestamps: true, // Automatically adds createdAt and updatedAt
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',

  });

  return UserFeatures;
};
