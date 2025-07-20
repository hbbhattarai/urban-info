const { createOAuth2Client } = require('../utils/googleAuth');

/**
 * Middleware to attach authenticated Google OAuth2 client to req
 * Assumes access token is stored in req.session or req.user
 */
function googleDriveAuthMiddleware(req, res, next) {
  const accessToken = req.session?.googleAccessToken || req.user?.googleAccessToken;

  if (!accessToken) {
    return res.status(401).send('Google access token missing');
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  req.oauth2Client = oauth2Client;
  next();
}

module.exports = googleDriveAuthMiddleware;