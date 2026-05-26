const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');

// GET /api/todos - Get all todos
router.get('/', todoController.getAllTodos);

// POST /api/todos - Create new todo
router.post('/', todoController.createTodo);

// PUT /api/todos/:id - Update todo
router.put('/:id', todoController.updateTodo);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
