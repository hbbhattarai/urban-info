require("dotenv").config();
const { google } = require('googleapis');

function createOAuth2Client() {
  return new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
}

module.exports = { createOAuth2Client };
