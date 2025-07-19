require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const serverless = require('serverless-http');

const { sequelize, Survey } = require('./models');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const shapefileRoutes = require('./routes/surveyShapefileRoutes');
const surveyControlRoutes = require('./routes/surveyControlRoutes');

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session store
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.session.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
}

// Routes
app.use('/', authRoutes);
app.use('/admin/users', authMiddleware, roleMiddleware(['admin']), userRoutes);
app.use('/admin/surveys', authMiddleware, roleMiddleware(['admin']), surveyRoutes);
app.use('/admin/surveys/shapefile', authMiddleware, roleMiddleware(['admin']), shapefileRoutes);
app.use('/editor/surveys', authMiddleware, roleMiddleware(['editor']), surveyControlRoutes);

app.get('/admin', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('admin', { username: req.session.username, surveys });
});

app.get('/editor', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('editor', { username: req.session.username, surveys });
});

app.get('/user', authMiddleware, roleMiddleware(['user']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('user', { username: req.session.username, surveys });
});

app.get('/', (req, res) => res.redirect('/login'));


let initialized = false;
async function initialize() {
  if (!initialized) {
    await sequelize.sync(); 
    await sessionStore.sync();
    initialized = true;
  }
}

module.exports = async (req, res) => {
  try {
    await initialize();
    return serverless(app)(req, res);
  } catch (err) {
    console.error('Error initializing server:', err);
    res.status(500).send('Server initialization error.');
  }
};
