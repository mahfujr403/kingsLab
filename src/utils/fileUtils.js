const cloudinary = require('../config/cloudinary');

/**
 * Extract Cloudinary public_id from URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Handle Cloudinary URLs
  if (url.includes('cloudinary.com')) {
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/kings-lab/images/sample.jpg
    // Extract: kings-lab/images/sample
    
    const matches = url.match(/\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  
  return null;
};

/**
 * Delete file from Cloudinary
 * @param {string} url - File URL or public_id
 * @param {string} resourceType - 'image', 'raw', or 'video'
 * @returns {Promise<boolean>}
 */
const deleteCloudinaryFile = async (url, resourceType = 'image') => {
  try {
    if (!url) return false;
    
    // Extract public_id from URL
    let publicId = extractPublicId(url);
    
    // If not a Cloudinary URL, assume it's already a public_id
    if (!publicId) {
      publicId = url;
    }
    
    if (!publicId) {
      console.warn('⚠️  Could not extract public_id from:', url);
      return false;
    }
    
    console.log(`🗑️  Deleting from Cloudinary: ${publicId} (${resourceType})`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    if (result.result === 'ok' || result.result === 'not found') {
      console.log(`✅ Deleted: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️  Cloudinary delete result: ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting from Cloudinary:`, error.message);
    return false;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<{url: string, resourceType: string}>} files
 * @returns {Promise<Array<boolean>>}
 */
const deleteMultipleFiles = async (files) => {
  const deletePromises = files.map(({ url, resourceType = 'image' }) =>
    deleteCloudinaryFile(url, resourceType)
  );
  return Promise.all(deletePromises);
};

/**
 * Get file information from uploaded file
 * @param {Object} file - Multer file object from Cloudinary
 * @returns {Object}
 */
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    url: file.path, // Cloudinary URL
    publicId: file.filename, // Public ID
    format: file.format,
    size: file.size,
    resourceType: file.resource_type,
  };
};

/**
 * Handle file deletion when updating a resource
 * @param {string} oldUrl - Old file URL
 * @param {Object} newFile - New uploaded file
 * @param {string} resourceType - 'image' or 'raw'
 * @returns {Promise<string>} - New file URL
 */
const handleFileUpdate = async (oldUrl, newFile, resourceType = 'image') => {
  // If new file uploaded, delete old one
  if (newFile && oldUrl) {
    await deleteCloudinaryFile(oldUrl, resourceType);
    return newFile.path;
  }
  
  // If no new file, keep old URL
  if (!newFile && oldUrl) {
    return oldUrl;
  }
  
  // If new file but no old file
  if (newFile) {
    return newFile.path;
  }
  
  // No file at all
  return null;
};

module.exports = {
  extractPublicId,
  deleteCloudinaryFile,
  deleteMultipleFiles,
  getFileInfo,
  handleFileUpdate,
};
