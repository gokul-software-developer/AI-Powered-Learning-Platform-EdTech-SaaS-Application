const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define('Todo', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ToDoList',
    timestamps: true
  });

  // Add methods to the model
  Todo.getAllTodos = async () => {
    return await Todo.findAll({
      order: [['id', 'ASC']]
    });
  };

  Todo.createTodo = async ({ title, time, description }) => {
    return await Todo.create({ title, time, description });
  };

  Todo.updateTodo = async (id, { title, time, description }) => {
    const todo = await Todo.findByPk(id);
    if (!todo) throw new Error('Todo not found');
    return await todo.update({ title, time, description });
  };

  Todo.deleteTodo = async (id) => {
    const todo = await Todo.findByPk(id);
    if (!todo) throw new Error('Todo not found');
    await todo.destroy();
    return { message: "Task deleted" };
  };

  return Todo;
};