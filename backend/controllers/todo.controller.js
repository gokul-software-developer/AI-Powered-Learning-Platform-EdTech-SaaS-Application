// controllers/todo.controller.js
const { ToDoList } = require('../models'); // Import from index.js

const todoController = {
  getAllTodos: async (req, res) => {
    try {
      const todos = await ToDoList.getAllTodos();
      res.json(todos);
    } catch (error) {
      console.error('Error getting todos:', error);
      res.status(500).json({ error: error.message });
    }
  },

  createTodo: async (req, res) => {
    try {
      const { title, time, description } = req.body;
      console.log('Creating todo with:', { title, time, description });
      const todo = await ToDoList.createTodo({ title, time, description });
      res.status(201).json(todo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateTodo: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, time, description } = req.body;
      const todo = await ToDoList.updateTodo(id, { title, time, description });
      res.json(todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteTodo: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await ToDoList.deleteTodo(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = todoController;