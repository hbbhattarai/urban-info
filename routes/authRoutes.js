const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login page
router.get('/login', (req, res) => res.render('login', { error: null }));

// Handle login
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
