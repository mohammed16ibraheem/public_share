const { downloadFile } = require('../utils/api');
const progress = require('../utils/progress');
const terminal = require('../utils/terminal');
const config = require('../utils/config');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

/**
 * Download a file from Valtstorage
 * @param {string} shareUrl Share URL or ID to download
 * @returns {Promise<Object>} Result object with success status
 */
async function download(shareUrl) {
  // Get colors from config
  const primaryColor = config.getColor('primary');
  const successColor = config.getColor('success');
  const errorColor = config.getColor('error');
  
  console.log(chalk[primaryColor](`Downloading from Valtstorage...`));
  
  // Extract file ID from URL
  const fileId = extractIdFromUrl(shareUrl);
  if (!fileId) {
    console.error(chalk[errorColor](`Error: Invalid share URL format`));
    await displayFooter();
    
    // Check if we're in interactive mode
    if (terminal.isInDedicatedWindow() && config.get('interactiveMode', true)) {
      const returnToMenu = await terminal.promptReturnToMainMenu();
      return { success: false, returnToMenu };
    }
    
    return { success: false };
  }
  
  // Start progress bar
  const bar = progress.createProgressBar();
  bar.start(100, 0);
  
  // Simulate progress updates
  const progressInterval = setInterval(() => {
    const currentValue = bar.value;
    if (currentValue < 95) {
      bar.update(currentValue + 5);
    }
  }, 500);
  
  try {
    const response = await downloadFile(shareUrl);
    
    // Determine filename from content-disposition header or use a default
    const filename = getFilenameFromResponse(response) || `valtstorage-${fileId}.zip`;
    const writer = fs.createWriteStream(filename);
    
    // Setup event handlers for writer
    const downloadPromise = new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', err => reject(err));
    });
    
    // Pipe the data to the file
    response.data.pipe(writer);
    
    // Wait for the download to complete
    const savedFilename = await downloadPromise;
    
    clearInterval(progressInterval);
    bar.update(100);
    bar.stop();
    
    console.log(chalk[successColor](`\n✅ File saved: ${chalk.bold(savedFilename)}`));
    console.log(chalk[successColor](`\nYour file has been securely retrieved from the decentralized network.`));
    
    await displayFooter();
    
    // Check if we're in interactive mode
    if (terminal.isInDedicatedWindow() && config.get('interactiveMode', true)) {
      const returnToMenu = await terminal.promptReturnToMainMenu();
      return { success: true, filename: savedFilename, returnToMenu };
    }
    
    return { success: true, filename: savedFilename };
  } catch (error) {
    clearInterval(progressInterval);
    bar.stop();
    console.error(chalk[errorColor](`\nError downloading file: ${error.message}`));
    
    await displayFooter();
    
    // Check if we're in interactive mode
    if (terminal.isInDedicatedWindow() && config.get('interactiveMode', true)) {
      const returnToMenu = await terminal.promptReturnToMainMenu();
      return { success: false, returnToMenu };
    }
    
    return { success: false };
  }
}

function extractIdFromUrl(url) {
  // Remove any trailing slashes
  url = url.replace(/\/$/, '');
  const parts = url.split('/');
  return parts[parts.length - 1];
}

function getFilenameFromResponse(response) {
  const disposition = response.headers['content-disposition'];
  if (disposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }
  }
  return null;
}

// Display the developer contact footer
async function displayFooter() {
  console.log();
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
  console.log(chalk.gray(`Developer's Telegram ID: ${chalk.white('@I_am_codeing')}`));
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
  
  // In dedicated window mode, we can add a small pause for readability
  if (terminal.isInDedicatedWindow() && !config.get('interactiveMode', true)) {
    await terminal.waitForKeypress('\nPress any key to continue...');
  }
}

module.exports = download;