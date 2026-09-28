const express = require('express');

const router = express.Router();

const {
  register,
  login
} = require('../controllers/authController');


// Register
router.post('/register', register);


// Login
router.post('/login', login);


// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth route is working!'
  });
});

console.log('AUTH ROUTES LOADED');


module.exports = router;