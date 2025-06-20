const cliProgress = require('cli-progress');
const chalk = require('chalk');

/**
 * Creates an enhanced progress bar for CLI operations
 * @param {string} initialStatus - Initial status message
 * @return {cliProgress.SingleBar} Progress bar instance
 */
function createProgressBar(initialStatus = 'Initializing...') {
  const progressBar = new cliProgress.SingleBar({
    format: (options, params, payload) => {
      const bar = chalk.cyan(params.progress >= 100 ? 
        '■'.repeat(options.barsize) : 
        '■'.repeat(Math.floor(params.progress / 100 * options.barsize)) + 
        '□'.repeat(Math.ceil((100 - params.progress) / 100 * options.barsize))
      );
      
      // Status message that changes at 100%
      const status = params.progress >= 100 ? 
        chalk.green('Complete') : 
        chalk.cyan(payload.status || 'Processing...');
      
      // Spinner animation characters
      const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      const spinner = params.progress >= 100 ? 
        chalk.green('✓') : 
        chalk.cyan(spinnerChars[payload.spinnerIndex || 0]);
      
      return `${spinner} ${bar} | ${chalk.cyan(params.progress.toFixed(0) + '%')} | ${status}`;
    },
    hideCursor: true,
    clearOnComplete: false,
    barsize: 30
  }, cliProgress.Presets.shades_classic);
  
  // Initialize spinner animation
  let spinnerIndex = 0;
  progressBar.spinnerInterval = setInterval(() => {
    spinnerIndex = (spinnerIndex + 1) % 10;
    progressBar.update(progressBar.value, { spinnerIndex, status: progressBar.payload.status });
  }, 80);
  
  // Store initial status
  progressBar.payload = { status: initialStatus, spinnerIndex: 0 };
  
  // Override the stop method to clear the spinner interval
  const originalStop = progressBar.stop;
  progressBar.stop = function() {
    clearInterval(this.spinnerInterval);
    return originalStop.call(this);
  };
  
  // Add a method to update status
  progressBar.updateStatus = function(status) {
    this.payload.status = status;
    this.update(this.value, this.payload);
  };
  
  return progressBar;
}

module.exports = {
  createProgressBar
};