const open = require('open');
const chalk = require('chalk');
const terminal = require('../utils/terminal');
const config = require('../utils/config');

/**
 * Scan blockchain record for a file
 * @param {string} shareUrl Share URL or ID to scan
 * @returns {Promise<Object>} Result object with success status
 */
async function scan(shareUrl) {
  // Get colors from config
  const primaryColor = config.getColor('primary');
  const successColor = config.getColor('success');
  const errorColor = config.getColor('error');
  const secondaryColor = config.getColor('secondary');
  
  console.log(chalk[primaryColor](`Opening blockchain explorer in your browser...`));
  
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
  
  const scanUrl = `https://valtstorage.cloud/valt.scan?address=${fileId}`;
  
  try {
    // Open browser to the valt.scan explorer
    await open(scanUrl);
    
    console.log(chalk[successColor](`\nBrowser opened to: ${chalk.bold(scanUrl)}`));
    console.log(chalk[secondaryColor](`\nVerifying file integrity and blockchain records...`));
    
    await displayFooter();
    
    // Check if we're in interactive mode
    if (terminal.isInDedicatedWindow() && config.get('interactiveMode', true)) {
      const returnToMenu = await terminal.promptReturnToMainMenu();
      return { success: true, scanUrl, returnToMenu };
    }
    
    return { success: true, scanUrl };
  } catch (error) {
    console.error(chalk[errorColor](`\nError opening browser: ${error.message}`));
    console.log(chalk.yellow(`\nPlease manually open this URL in your browser: ${chalk.bold(scanUrl)}`));
    
    await displayFooter();
    
    // Check if we're in interactive mode
    if (terminal.isInDedicatedWindow() && config.get('interactiveMode', true)) {
      const returnToMenu = await terminal.promptReturnToMainMenu();
      return { success: false, scanUrl, returnToMenu };
    }
    
    return { success: false, scanUrl };
  }
}

function extractIdFromUrl(url) {
  // Remove any trailing slashes
  url = url.replace(/\/$/, '');
  const parts = url.split('/');
  return parts[parts.length - 1];
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

module.exports = scan;