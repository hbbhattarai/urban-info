const { google } = require('googleapis');
const stream = require('stream');

/**
 * Uploads a single file to Google Drive using OAuth2 credentials
 * @param {object} oauth2Client - An authorized OAuth2 client (with user access token)
 * @param {object} file - Multer file object with buffer, originalname, and mimetype
 * @returns {Promise<object>} - Google Drive file data including webContentLink
 */
async function uploadFileToDrive(oauth2Client, file) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const folderId = '1br4EfMPi96LtRgJPRvADCTzDKflB-GXq'; // Your target folder ID

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: bufferStream,
  };

  try {
    const fileRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Make file public
    await drive.permissions.create({
      fileId: fileRes.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('File uploaded successfully:', fileRes.data.id);
    return fileRes.data;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

module.exports = { uploadFileToDrive };