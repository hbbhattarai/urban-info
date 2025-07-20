const { google } = require('googleapis');
const path = require('path');

// Auth config
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/urban-info-survey-gmc.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function uploadFileToDrive(file) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      mimeType: file.mimetype,
    },
    media: {
      mimeType: file.mimetype,
      body: file.buffer,
    },
  });

  // Make file public
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`;
  return publicUrl;
}

async function uploadFilesToDrive(files) {
  const uploadedUrls = [];
  for (const file of files) {
    const url = await uploadFileToDrive(file);
    uploadedUrls.push(url);
  }
  return uploadedUrls;
}

module.exports = uploadFilesToDrive;