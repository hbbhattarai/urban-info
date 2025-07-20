const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { Readable } = require('stream');

let drive; // we'll initialize this once

async function initializeDrive() {
  if (drive) return drive; // reuse if already initialized

  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../config/urban-info-survey-gmc.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const authClient = await auth.getClient();
  drive = google.drive({ version: 'v3', auth: authClient });
  return drive;
}

async function uploadFileToDrive(file) {

  const drive = await initializeDrive(); 
  const fileMetadata = {
    name: file.originalname,
  };

  const media = {
    mimeType: file.mimetype,
    body: Readable.from(file.buffer), // use memory buffer
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  return response.data.webViewLink;
}

module.exports = { uploadFileToDrive };
