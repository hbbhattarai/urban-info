const { google } = require('googleapis');
const path = require('path');
const stream = require('stream');
const apikeys = path.join(__dirname,'../config/keyFile.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Create an authorized Google API client


async function authorize() {
  const auth = new google.auth.JWT({
    keyFile: apikeys,
    scopes: SCOPES,
  }
   
  );
  await auth.authorize();
  return auth;
}


/**
 * Uploads a single file to Google Drive from memory and returns its webContentLink
 * @param {object} file - Multer file object with buffer, originalname, and mimetype
 * @returns {Promise<object>} - Google Drive file data including webContentLink
 */
async function uploadFileToDrive(file) {
  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });

  const folderId = '1br4EfMPi96LtRgJPRvADCTzDKflB-GXq';

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId]
  };

  const media = {
    mimeType: file.mimetype,
    body: bufferStream
  };

  try {
    const fileRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make file public
    await drive.permissions.create({
      fileId: fileRes.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return fileRes.data;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

module.exports = { uploadFileToDrive };
