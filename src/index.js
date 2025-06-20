#!/usr/bin/env node

const { Command } = require('commander');
const upload = require('./commands/upload.js');
const download = require('./commands/download.js');
const scan = require('./commands/scan.js');
const chalk = require('chalk');
const boxen = require('boxen');
const terminal = require('./utils/terminal');
const fs = require('fs');
const path = require('path');

// Display the banner with boxen
function displayBanner() {
  const bannerText = `${chalk.bold.cyan('VALTSTORAGE.CLOUD')}\n${chalk.white('Decentralized Storage with Proof of Activity')}`;
  
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
    backgroundColor: '#000'
  };
  
  const banner = boxen(bannerText, boxenOptions);
  console.log(banner);
}

// Display examples and help
function displayHelp() {
  console.log('Available commands:');
  console.log(`  ${chalk.cyan('upload')} <file>              Upload a file to ValStorage`);
  console.log(`  ${chalk.cyan('download')} <shareUrl>        Download a file from ValStorage`);
  console.log(`  ${chalk.cyan('scan')} <shareUrl>            View blockchain verification`);
  console.log(`  ${chalk.cyan('help')}                       Show this help message`);
  console.log(`  ${chalk.cyan('exit')}                       Exit the ValStorage CLI`);
  console.log(`  ${chalk.cyan('clear')}                      Clear the terminal screen`);
  console.log();
  console.log(`For more information visit: ${chalk.cyan('https://valtstorage.cloud')}`);
}

// Display the developer contact footer
function displayFooter() {
  console.log();
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
  console.log(chalk.gray(`Developer's Telegram ID: ${chalk.white('@I_am_codeing')}`));
  console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
}

/**
 * Handle shell commands
 * @param {string} input Command input
 */
async function handleShellCommand(input) {
  const args = input.split(' ');
  const command = args[0].toLowerCase();
  
  if (command === 'exit') {
    console.log(chalk.yellow('Exiting ValStorage CLI. Goodbye!'));
    process.exit(0);
  }
  
  if (command === 'clear') {
    terminal.clearScreen();
    displayBanner();
    return;
  }
  
  if (command === 'help') {
    displayHelp();
    return;
  }
  
  if (command === 'upload') {
    if (args.length < 2) {
      console.log(chalk.red('Error: Missing file path'));
      console.log(chalk.yellow('Usage: upload <file>'));
      return;
    }
    
    const filePath = args[1];
    await upload(filePath);
    return;
  }
  
  if (command === 'download') {
    if (args.length < 2) {
      console.log(chalk.red('Error: Missing share URL'));
      console.log(chalk.yellow('Usage: download <shareUrl>'));
      return;
    }
    
    const shareUrl = args[1];
    await download(shareUrl);
    return;
  }
  
  if (command === 'scan') {
    if (args.length < 2) {
      console.log(chalk.red('Error: Missing share URL'));
      console.log(chalk.yellow('Usage: scan <shareUrl>'));
      return;
    }
    
    const shareUrl = args[1];
    await scan(shareUrl);
    return;
  }
  
  console.log(chalk.red(`Unknown command: ${command}`));
  console.log(chalk.yellow('Type "help" to see available commands'));
}

// Check if any arguments were provided
const hasArguments = process.argv.length > 2;

// If no arguments, start interactive shell
if (!hasArguments) {
  // Clear the screen and display banner
  terminal.clearScreen();
  displayBanner();
  displayHelp();
  
  // Start interactive shell
  terminal.createShell(handleShellCommand);
} else {
  // Traditional CLI mode with Commander
  const program = new Command();
  
  // Display banner if not in help mode
  if (!process.argv.includes('--help') && !process.argv.includes('-h')) {
    displayBanner();
  }
  
  program
    .name('valtstorage')
    .description('Secure file storage and sharing with blockchain verification')
    .version('1.0.0');
  
  program
    .command('upload')
    .description('Upload a file to Valtstorage')
    .argument('<file>', 'File to upload')
    .action((file) => {
      upload(file);
    });
  
  program
    .command('download')
    .description('Download a file from Valtstorage')
    .argument('<shareUrl>', 'Share URL to download')
    .action((shareUrl) => {
      download(shareUrl);
    });
  
  program
    .command('scan')
    .description('View blockchain record for a file')
    .argument('<shareUrl>', 'Share URL to scan')
    .action((shareUrl) => {
      scan(shareUrl);
    });
  
  // Add help examples
  program.addHelpText('after', `
Examples:
  $ valtstorage upload ./document.pdf      Upload a document
  $ valtstorage download https://valtstorage.cloud/share/V1234567
  $ valtstorage scan V1234567              View blockchain verification

For more information visit: https://valtstorage.cloud
`);
  
  // Export these functions so they can be used by command files
  module.exports = {
    displayBanner,
    displayFooter
  };
  
  program.parse();
}