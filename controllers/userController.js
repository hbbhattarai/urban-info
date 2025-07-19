const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.render('users/index', { users });
};

exports.showAddForm = (req, res) => {
  res.render('users/add');
};

exports.addUser = async (req, res) => {
  const { username, role } = req.body;
  const newpassword = req.body.newpassword;
  try {
    const saltRounds = 10;
     const password = await bcrypt.hash(newpassword,saltRounds);
     console.log(password)
    await User.create({ username, password, role });
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Error creating user: ' + err.message);
  }
};

exports.showEditForm = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.render('users/edit', { user });
};

exports.updateUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    await User.update(
      { username, password, role },
      { where: { id: req.params.id } }
    );
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Error updating user: ' + err.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).send('Error deleting user: ' + err.message);
  }
};
