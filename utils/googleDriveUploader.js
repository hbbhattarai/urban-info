const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/urban-info-survey-gmc.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function uploadFileToDrive(file) {
  const fileMetadata = {
    name: file.originalname,
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path), // ✅ This must be a stream
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  return response.data.webViewLink;
}

module.exports = uploadFileToDrive;
