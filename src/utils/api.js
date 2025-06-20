const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Get API base URL from configuration
const API_BASE_URL = config.getApiBaseUrl();

// Check if we're in demo mode
const IS_DEMO_MODE = config.isDemoMode();

/**
 * Upload a file to Valtstorage
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<Object>} - Response data
 */
async function uploadFile(filePath) {
  // Validate input
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Handle demo mode
  if (IS_DEMO_MODE) {
    // Don't log in demo mode, just simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    
    // Get file type from extension or default to application/octet-stream
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    // Simple mime type detection
    if (['.pdf'].includes(ext)) {
      mimeType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      mimeType = 'image/jpeg';
    } else if (['.png'].includes(ext)) {
      mimeType = 'image/png';
    } else if (['.txt'].includes(ext)) {
      mimeType = 'text/plain';
    } else if (['.doc', '.docx'].includes(ext)) {
      mimeType = 'application/msword';
    }
    
    return {
      success: true,
      share_url: `https://valtstorage.cloud/share/V${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      expires_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      files: [{
        name: path.basename(filePath),
        size: fs.statSync(filePath).size,
        mime_type: mimeType
      }],
      optimization_level: "Lightning Fast"
    };
  }
  
  // Removed console.log that was showing the API URL
  
  // Add timeout from configuration
  const timeout = config.get('timeout', 60000);
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  });
  
  try {
    // This calls your existing upload API endpoint
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: timeout
    });
    
    return response.data;
  } catch (error) {
    // Simplified error handling to avoid excessive logging
    let errorMessage = 'Upload failed';
    if (error.response) {
      errorMessage = `Upload failed: Server returned ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Upload failed: No response received from server';
    } else {
      errorMessage = `Upload failed: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Download a file from Valtstorage
 * @param {string} shareUrl - The share URL to download
 * @returns {Promise<Object>} - Axios response with stream
 */
async function downloadFile(shareUrl) {
  if (!shareUrl || typeof shareUrl !== 'string') {
    throw new Error('Invalid share URL');
  }
  
  // Extract ID from share URL
  const id = extractIdFromUrl(shareUrl);
  if (!id) {
    throw new Error('Invalid share URL format');
  }
  
  // Handle demo mode
  if (IS_DEMO_MODE) {
    // Don't log in demo mode
    
    // Get a sample file for demo mode
    let sampleFile = path.join(__dirname, '../../package.json');
    
    // Try to find a better sample file for demo
    const possibleSamples = [
      path.join(__dirname, '../../README.md'),
      path.join(__dirname, '../../test.pdf')
    ];
    
    for (const sample of possibleSamples) {
      if (fs.existsSync(sample)) {
        sampleFile = sample;
        break;
      }
    }
    
    // Create a mock response with a readable stream
    const mockData = fs.createReadStream(sampleFile);
    const mockResponse = {
      data: mockData,
      headers: {
        'content-disposition': `attachment; filename="valtstorage-${id}-${path.basename(sampleFile)}"`,
        'content-type': path.extname(sampleFile) === '.pdf' ? 'application/pdf' : 'application/octet-stream'
      }
    };
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return mockResponse;
  }
  
  try {
    // Get timeout from configuration
    const timeout = config.get('timeout', 60000);
    
    // This calls your existing download API endpoint
    const response = await axios.get(`${API_BASE_URL}/download-zip/${id}`, {
      responseType: 'stream',
      timeout: timeout
    });
    
    return response;
  } catch (error) {
    // Simplified error handling
    let errorMessage = 'Download failed';
    if (error.response) {
      errorMessage = `Download failed: Server returned ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Download failed: No response received from server';
    } else {
      errorMessage = `Download failed: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Extract ID from a Valtstorage share URL
 * @param {string} url - The share URL
 * @returns {string|null} - The extracted ID or null if invalid
 */
function extractIdFromUrl(url) {
  if (!url) return null;
  
  // Handle both URL and direct ID input
  if (url.startsWith('V') && url.length > 8 && !url.includes('/')) {
    return url; // Already an ID
  }
  
  // Remove any trailing slashes
  url = url.replace(/\/$/, '');
  const parts = url.split('/');
  return parts[parts.length - 1];
}

/**
 * Get information about a shared file
 * @param {string} shareUrl - The share URL or ID
 * @returns {Promise<Object>} - File information
 */
async function getFileInfo(shareUrl) {
  if (!shareUrl || typeof shareUrl !== 'string') {
    throw new Error('Invalid share URL');
  }
  
  // Extract ID from share URL
  const id = extractIdFromUrl(shareUrl);
  if (!id) {
    throw new Error('Invalid share URL format');
  }
  
  // Handle demo mode
  if (IS_DEMO_MODE) {
    // Don't log in demo mode
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    return {
      share_url: `https://valtstorage.cloud/share/${id}`,
      expires_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      files: [{
        name: `document-${id}.pdf`,
        size: 1024 * 1024 * 2, // 2MB
        mime_type: 'application/pdf'
      }]
    };
  }
  
  try {
    // Get timeout from configuration
    const timeout = config.get('timeout', 60000);
    
    const response = await axios.get(`${API_BASE_URL}/get/${id}`, {
      timeout: timeout
    });
    return response.data;
  } catch (error) {
    // Simplified error handling
    let errorMessage = 'Failed to get file info';
    if (error.response) {
      errorMessage = `Failed to get file info: Server returned ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Failed to get file info: No response received from server';
    } else {
      errorMessage = `Failed to get file info: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Get blockchain record for a file
 * @param {string} shareUrl - The share URL or ID
 * @returns {Promise<Object>} - Blockchain record
 */
async function getBlockchainRecord(shareUrl) {
  if (!shareUrl || typeof shareUrl !== 'string') {
    throw new Error('Invalid share URL');
  }
  
  // Extract ID from share URL
  const id = extractIdFromUrl(shareUrl);
  if (!id) {
    throw new Error('Invalid share URL format');
  }
  
  // Handle demo mode
  if (IS_DEMO_MODE) {
    // Don't log in demo mode
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
    
    // Current timestamp for demo dates
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 7200000);
    
    // Create a realistic-looking blockchain record
    return {
      record_id: id,
      file_name: "Block data",
      file_size: 1024 * 1024 * 2, // 2MB
      file_type: "application/pdf",
      upload_date: now.toISOString(),
      expiry_date: twoHoursLater.toISOString(),
      status: "active",
      download_count: Math.floor(Math.random() * 5),
      transaction_count: Math.floor(Math.random() * 10) + 1,
      is_verified: true,
      expires_in: "2 hours",
      processed_streaming: false,
      optimization_level: "Lightning Fast",
      transactions: [
        {
          id: `tx_upload_${Math.floor(now.getTime() / 1000)}`,
          transaction_type: "FileUpload",
          timestamp: now.toISOString(),
          details: {
            file_id: id,
            file_name: "Block data",
            file_size: 1024 * 1024 * 2,
            file_type: "application/pdf",
            processed_streaming: false
          },
          confirmed: true
        },
        {
          id: `tx_access_${Math.floor(now.getTime() / 1000) + 60}`,
          transaction_type: "AccessAttempt",
          timestamp: new Date(now.getTime() + 60000).toISOString(),
          details: {
            timestamp: new Date(now.getTime() + 60000).toISOString(),
            action: "view_info",
            client_info: "Access from file info page"
          },
          confirmed: true
        }
      ]
    };
  }
  
  try {
    // Get timeout from configuration
    const timeout = config.get('timeout', 60000);
    
    const response = await axios.get(`${API_BASE_URL}/blockchain/${id}`, {
      timeout: timeout
    });
    return response.data;
  } catch (error) {
    // Simplified error handling
    let errorMessage = 'Failed to get blockchain record';
    if (error.response) {
      errorMessage = `Failed to get blockchain record: Server returned ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Failed to get blockchain record: No response received from server';
    } else {
      errorMessage = `Failed to get blockchain record: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Get scan URL for a file
 * @param {string} shareUrl - The share URL or ID
 * @returns {string} - URL to scan page
 */
function getScanUrl(shareUrl) {
  const id = extractIdFromUrl(shareUrl);
  if (!id) {
    throw new Error('Invalid share URL format');
  }
  
  return `https://valtstorage.cloud/valt.scan?address=${id}`;
}

// Export the functions
module.exports = {
  uploadFile,
  downloadFile,
  getFileInfo,
  getBlockchainRecord,
  extractIdFromUrl,
  getScanUrl,
  IS_DEMO_MODE
};