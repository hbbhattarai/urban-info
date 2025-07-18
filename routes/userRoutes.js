const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// View all users
router.get('/', userController.getAllUsers);

// Show form to add user
router.get('/add', userController.showAddForm);

// Handle add user
router.post('/add', userController.addUser);

// Show form to edit user
router.get('/edit/:id', userController.showEditForm);

// Handle edit user
router.post('/edit/:id', userController.updateUser);

// Handle delete user
router.post('/delete/:id', userController.deleteUser);

module.exports = router;
