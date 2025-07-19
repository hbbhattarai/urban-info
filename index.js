require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, Survey } = require('./models');

/// Routes Identififer
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const shapefileRoutes = require('./routes/surveyShapefileRoutes');
const surveyControlRoutes = require('./routes/surveyControlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Session store
const sessionStore = new SequelizeStore({ db: sequelize });

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
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

// Static files (css, js)
 app.use('/uploads', express.static('uploads'));

// Auth Routes
app.use('/', authRoutes);

// Admin Routes
app.use('/admin/users', authMiddleware, roleMiddleware(['admin']), userRoutes);
app.use('/admin/surveys', authMiddleware, roleMiddleware(['admin']), surveyRoutes);
app.use('/admin/surveys/shapefile', authMiddleware, roleMiddleware(['admin']), shapefileRoutes);

// Editor Routes
app.use('/editor/surveys', authMiddleware, roleMiddleware(['editor']), surveyControlRoutes);

// Admin dashboard
app.get('/admin', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('admin', {
    username: req.session.username,
    surveys,
  });
});

// Editor dashboard
app.get('/editor', authMiddleware, roleMiddleware(['editor']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('editor', {
    username: req.session.username,
    surveys,
  });
});

// User dashboard
app.get('/user', authMiddleware, roleMiddleware(['user']), async (req, res) => {
  const surveys = await Survey.findAll({ attributes: ['id', 'name'] });
  res.render('user', {
    username: req.session.username,
    surveys,
  });
});

app.get('/', (req, res) => res.redirect('/login'));

// Sync database tables and start server
async function startServer() {
  try {
    // Sync all models (you can also call syncAll() if you exported that)
    await sequelize.sync({ alter: true });
    sessionStore.sync(); // Ensure session table exists

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();