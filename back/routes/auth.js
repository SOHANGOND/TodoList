const router = require('express').Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
  
  // Authentication routes
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const user = new User({ username, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Username already exists' });
    }
  });
  
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
  
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  });


  module.exports = router;
