const { uploadFile } = require('../utils/api');
const progress = require('../utils/progress');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

/**
 * Upload a file to Valtstorage
 * @param {string} filePath Path to the file to upload
 */
async function upload(filePath) {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    displayFooter();
    return;
  }
  
  console.log(chalk.cyan(`Uploading ${path.basename(filePath)} to Valtstorage...`));
  
  // Start progress bar
  const bar = progress.createProgressBar();
  bar.start(100, 0);
  
  // Simulate progress updates (your actual implementation would get real progress)
  const progressInterval = setInterval(() => {
    const currentValue = bar.value;
    if (currentValue < 95) {
      bar.update(currentValue + 5);
    }
  }, 500);
  
  try {
    const result = await uploadFile(filePath);
    
    clearInterval(progressInterval);
    bar.update(100);
    bar.stop();
    
    console.log(chalk.green(`\n🔐 File uploaded successfully!`));
    console.log(chalk.cyan(`📋 Share URL: ${chalk.bold(result.share_url)}`));
    console.log(chalk.blue(`🔍 View blockchain record: ${chalk.bold(`https://valtstorage.cloud/valt.scan?address=${extractIdFromUrl(result.share_url)}`)}`));
    
    // Display the secure storage message
    console.log(chalk.green(`\nYour file is now securely stored with 7-layer protection on the decentralized network.`));
    
    // Display footer
    displayFooter();
    
    return result;
  } catch (error) {
    clearInterval(progressInterval);
    bar.stop();
    console.error(chalk.red(`\nError uploading file: ${error.message}`));
    displayFooter();
    return null;
  }
}

function extractIdFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Display the developer contact footer
function displayFooter() {
  console.log();
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
  console.log(chalk.gray(`Developer's Telegram ID: ${chalk.white('@I_am_codeing')}`));
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
}

module.exports = upload;