const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createOAuth2Client } = require('../utils/googleAuth');
const scopes = ['https://www.googleapis.com/auth/drive.file']; 

// Login page
router.get('/login', (req, res) => res.render('login', { error: null }));

// Handle login
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);



// Start Google Login
router.get('/google', (req, res) => {
  const oauth2Client = createOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

// Google OAuth Callback
router.get('/google/callback', async (req, res) => {
  const oauth2Client = createOAuth2Client();
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.googleAccessToken = tokens.access_token;
    req.session.googleRefreshToken = tokens.refresh_token;
    console.log('Google tokens saved to session.');
    res.redirect('/login');
  } catch (err) {
    console.error('Error exchanging code for tokens:', err);
    res.status(500).send('Failed to authenticate with Google.');
  }
});

module.exports = router;
