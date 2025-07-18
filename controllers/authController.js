const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid username or password' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.username = user.username;

  return res.redirect(`/${user.role}`);
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
