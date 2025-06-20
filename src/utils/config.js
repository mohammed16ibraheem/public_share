const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Configuration manager for valtstorage-cli
 * Handles loading, saving, and accessing configuration settings
 */
class Config {
  constructor() {
    // Default configuration
    this.defaults = {
      apiUrl: 'https://valtstorage.cloud/api/public',
      environment: 'production', // 'production', 'development', or 'demo'
      tempDir: os.tmpdir(),
      maxConcurrentUploads: 3,
      timeout: 60000, // 60 seconds
      progressUpdateInterval: 500, // ms
      
      // Terminal window settings
      useDedicatedWindow: true, // Whether to launch a dedicated window
      windowTitle: 'ValStorage CLI', // Title for the dedicated window
      interactiveMode: true, // Whether to use interactive menu mode in dedicated window
      terminalColors: {
        primary: 'cyan',
        secondary: 'blue',
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'white',
        border: 'cyan'
      },
      // Theme options: 'default', 'dark', 'light', 'blue', 'green'
      terminalTheme: 'default'
    };
    
    // User configuration file path
    this.configDir = path.join(os.homedir(), '.valtstorage');
    this.configFile = path.join(this.configDir, 'config.json');
    
    // Current configuration (defaults + user settings)
    this.current = { ...this.defaults };
    
    // Try to load user configuration
    this.load();
  }
  
  /**
   * Load configuration from file
   */
  load() {
    try {
      if (fs.existsSync(this.configFile)) {
        const userData = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.current = { ...this.defaults, ...userData };
        
        // Apply environment variables (takes precedence)
        if (process.env.VALTSTORAGE_ENV) {
          this.current.environment = process.env.VALTSTORAGE_ENV;
        }
        
        if (process.env.VALTSTORAGE_API_URL) {
          this.current.apiUrl = process.env.VALTSTORAGE_API_URL;
        }
        
        // Apply terminal-specific environment variables
        if (process.env.VALTSTORAGE_WINDOW_TITLE) {
          this.current.windowTitle = process.env.VALTSTORAGE_WINDOW_TITLE;
        }
        
        if (process.env.VALTSTORAGE_INTERACTIVE === 'true') {
          this.current.interactiveMode = true;
        } else if (process.env.VALTSTORAGE_INTERACTIVE === 'false') {
          this.current.interactiveMode = false;
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error.message);
      // Fall back to defaults
      this.current = { ...this.defaults };
    }
    
    // Special case for demo mode
    if (this.current.environment === 'demo') {
      this.current.apiUrl = 'mock';
    }
    
    // Apply theme settings
    this.applyTheme(this.current.terminalTheme);
  }
  
  /**
   * Apply a predefined color theme
   * @param {string} themeName Name of the theme to apply
   */
  applyTheme(themeName) {
    const themes = {
      'default': {
        primary: 'cyan',
        secondary: 'blue',
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'white',
        border: 'cyan'
      },
      'dark': {
        primary: 'blue',
        secondary: 'cyan',
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'gray',
        border: 'blue'
      },
      'light': {
        primary: 'cyan',
        secondary: 'blue',
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'black',
        border: 'cyan'
      },
      'blue': {
        primary: 'blue',
        secondary: 'cyan',
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'white',
        border: 'blue'
      },
      'green': {
        primary: 'green',
        secondary: 'cyan',
        success: 'blue',
        error: 'red',
        warning: 'yellow',
        info: 'white',
        border: 'green'
      }
    };
    
    // Apply theme if it exists
    if (themes[themeName]) {
      this.current.terminalColors = { ...themes[themeName] };
    }
  }
  
  /**
   * Save current configuration to file
   */
  save() {
    try {
      // Create config directory if it doesn't exist
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      
      fs.writeFileSync(
        this.configFile, 
        JSON.stringify(this.current, null, 2),
        'utf8'
      );
      
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error.message);
      return false;
    }
  }
  
  /**
   * Get a configuration value
   * @param {string} key - Configuration key
   * @param {any} defaultValue - Default value if key not found
   * @returns {any} - Configuration value
   */
  get(key, defaultValue) {
    return key in this.current ? this.current[key] : defaultValue;
  }
  
  /**
   * Set a configuration value
   * @param {string} key - Configuration key
   * @param {any} value - Value to set
   * @param {boolean} persist - Whether to save to disk
   * @returns {boolean} - Success
   */
  set(key, value, persist = false) {
    this.current[key] = value;
    
    // Special handling for theme changes
    if (key === 'terminalTheme') {
      this.applyTheme(value);
    }
    
    if (persist) {
      return this.save();
    }
    
    return true;
  }
  
  /**
   * Get the API base URL based on current environment
   * @returns {string} - API base URL
   */
  getApiBaseUrl() {
    const env = this.get('environment');
    
    if (env === 'demo') {
      return 'mock';
    }
    
    return this.get('apiUrl');
  }
  
  /**
   * Check if we're in demo mode
   * @returns {boolean} - True if in demo mode
   */
  isDemoMode() {
    return this.get('environment') === 'demo';
  }
  
  /**
   * Get terminal color setting
   * @param {string} colorType - Color type (primary, secondary, etc.)
   * @returns {string} - Color name
   */
  getColor(colorType) {
    const colors = this.get('terminalColors', {});
    return colorType in colors ? colors[colorType] : 'white';
  }
  
  /**
   * Switch to a different environment
   * @param {string} env - Environment name ('production', 'development', 'demo')
   * @param {boolean} persist - Whether to save to disk
   * @returns {boolean} - Success
   */
  setEnvironment(env, persist = false) {
    const validEnvs = ['production', 'development', 'demo'];
    
    if (!validEnvs.includes(env)) {
      console.error(`Invalid environment: ${env}. Must be one of: ${validEnvs.join(', ')}`);
      return false;
    }
    
    this.current.environment = env;
    
    // Update API URL for the new environment
    if (env === 'production') {
      this.current.apiUrl = 'https://valtstorage.cloud/api/public';
    } else if (env === 'development') {
      this.current.apiUrl = 'http://localhost:8080/api/public';
    } else if (env === 'demo') {
      this.current.apiUrl = 'mock';
    }
    
    if (persist) {
      return this.save();
    }
    
    return true;
  }
  
  /**
   * Reset configuration to defaults
   * @param {boolean} persist - Whether to save to disk
   * @returns {boolean} - Success
   */
  reset(persist = false) {
    this.current = { ...this.defaults };
    
    if (persist) {
      return this.save();
    }
    
    return true;
  }
}

// Create and export a singleton instance
const config = new Config();
module.exports = config;