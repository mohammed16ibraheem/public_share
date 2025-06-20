const chalk = require('chalk');
const readline = require('readline');
const config = require('./config');

/**
 * Terminal utility for ValStorage CLI
 * Handles interactive shell functionality
 */

let rl; // readline interface

/**
 * Create an interactive shell
 * @param {Function} commandHandler Function to handle shell commands
 */
function createShell(commandHandler) {
  // Close existing readline interface if exists
  if (rl) {
    rl.close();
  }
  
  // Create a new readline interface
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('valtstorage > '),
    completer: shellCompleter
  });
  
  // Handle line input
  rl.on('line', async (line) => {
    line = line.trim();
    
    if (line) {
      try {
        // Pass the command to the handler
        await commandHandler(line);
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
    
    // Prompt for next command
    rl.prompt();
  });
  
  // Handle ctrl+c
  rl.on('SIGINT', () => {
    console.log(chalk.yellow('\nExiting ValStorage CLI. Goodbye!'));
    process.exit(0);
  });
  
  // Initial prompt
  rl.prompt();
  
  return rl;
}

/**
 * Tab completion for shell commands
 */
function shellCompleter(line) {
  const commands = ['upload', 'download', 'scan', 'help', 'exit', 'clear'];
  const hits = commands.filter((c) => c.startsWith(line));
  return [hits.length ? hits : commands, line];
}

/**
 * Clear the terminal screen
 */
function clearScreen() {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Windows approach
    process.stdout.write('\x1Bc');
  } else {
    // Unix approach
    process.stdout.write('\x1B[2J\x1B[0f');
  }
}

/**
 * Wait for user to press a key before continuing
 * @param {string} message Message to display
 * @returns {Promise} Resolves when key is pressed
 */
function waitForKeypress(message = 'Press any key to continue...') {
  // Save current readline state
  const oldPrompt = rl ? rl.getPrompt() : '';
  let oldRL = rl;
  
  console.log(chalk.cyan(message));
  
  return new Promise(resolve => {
    // Temporarily pause any existing readline
    if (oldRL) {
      oldRL.pause();
    }
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      
      // Restore readline if it existed
      if (oldRL) {
        oldRL.prompt();
        oldRL.resume();
      }
      
      resolve();
    });
  });
}

/**
 * Check if the application is running in a dedicated window
 * @returns {boolean} True if in dedicated window mode
 */
function isInDedicatedWindow() {
  return config.get('useDedicatedWindow', true);
}

/**
 * Prompt the user to return to the main menu
 * @returns {Promise<boolean>} Resolves with true if user wants to return
 */
async function promptReturnToMainMenu() {
  // Create a temporary readline interface if none exists
  const tempRl = rl || readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Get color from config
  const primaryColor = config.getColor('primary');
  
  // Prompt text with color
  const promptText = chalk[primaryColor]('\nReturn to main menu? (y/n): ');
  
  // Ask the user
  const answer = await new Promise(resolve => {
    tempRl.question(promptText, answer => {
      resolve(answer.trim().toLowerCase());
    });
  });
  
  // Close temporary readline if we created one
  if (!rl) {
    tempRl.close();
  }
  
  // Return true for yes, false for anything else
  return answer === 'y' || answer === 'yes';
}

/**
 * Creates a simple progress bar in the terminal
 * @param {number} total Total steps
 * @param {Object} options Options for the progress bar
 * @returns {Object} Progress bar object
 */
function createSimpleProgressBar(total, options = {}) {
  const width = options.width || 40;
  const completeChar = options.completeChar || '█';
  const incompleteChar = options.incompleteChar || '░';
  
  let current = 0;
  
  return {
    update(value) {
      current = value;
      const percent = Math.min(Math.floor((current / total) * 100), 100);
      const completeWidth = Math.floor((current / total) * width);
      const incompleteWidth = width - completeWidth;
      
      const bar = completeChar.repeat(completeWidth) + 
                  incompleteChar.repeat(incompleteWidth);
      
      process.stdout.write(`\r[${bar}] ${percent}% `);
      
      if (percent === 100) {
        process.stdout.write('\n');
      }
    },
    complete() {
      this.update(total);
    }
  };
}

/**
 * Closes the interactive shell
 */
function closeShell() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

module.exports = {
  createShell,
  clearScreen,
  waitForKeypress,
  createSimpleProgressBar,
  closeShell,
  isInDedicatedWindow,
  promptReturnToMainMenu
};