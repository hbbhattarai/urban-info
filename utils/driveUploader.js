const { uploadFileToDrive } = require('./googleDriveUploader');

/**
 * Uploads multiple Multer files to Google Drive.
 * @param {Array} files - Array of Multer file objects.
 * @param {object} oauth2Client - Authenticated Google OAuth2 client.
 * @returns {Promise<string[]>} - Array of webContentLinks.
 */
async function uploadFilesToDrive(files, oauth2Client) {
  const uploadPromises = files.map(file => uploadFileToDrive(oauth2Client, file));
  const uploadedFiles = await Promise.all(uploadPromises);
  return uploadedFiles.map(f => f.webContentLink);
}

module.exports = { uploadFilesToDrive };
