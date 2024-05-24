const router = require('express').Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo')


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token is not valid' });
      req.user = user;
      next();
    });
  };

router.get('/', authenticateToken, async (req, res) => {
    const todos = await Todo.find({ userId: req.user.userId });
    res.json(todos);
  });
  
  router.post('/', authenticateToken, async (req, res) => {
    const todo = new Todo({
      text: req.body.text,
      completed: req.body.completed,
      userId: req.user.userId,
    });
    await todo.save();
    res.json(todo);
  });
  
  router.put('/:id', authenticateToken, async (req, res) => {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
  
    todo.text = req.body.text;
    todo.completed = req.body.completed;
    await todo.save();
    res.json(todo);
  });
  
  router.delete('/:id', authenticateToken, async (req, res) => {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
  
    res.json({ message: 'Todo deleted' });
  });

module.exports = router;