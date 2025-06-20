# Valtstorage CLI

A command-line interface for interacting with Valtstorage - the secure, blockchain-based file storage and sharing platform with 7-layer protection on a decentralized network.

## Features

- **Secure Uploads** - Store files with blockchain verification and encryption
- **Easy Sharing** - Generate shareable links for your encrypted files
- **Blockchain Verification** - Verify file integrity with distributed ledger technology
- **Interactive Mode** - Use the CLI in interactive shell mode with tab completion
- **Customizable** - Configure themes, colors, and application behavior

## Installation


#### 1: Install the package globally
Since the error shows it's looking for the package in your global npm modules, you should install it globally:

npm install -g ./



### Option 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/valtstorage-cli.git

# Navigate to the directory
cd valtstorage-cli

# Install dependencies
npm install

# Run with npx
npx valtstorage upload a.jpg
```



## Commands

Valtstorage CLI offers three main commands to help you securely store, retrieve, and verify your files.

### Upload

Upload files to Valtstorage with blockchain verification.

```bash
valtstorage upload <file>
```

**Example:**

```bash
valtstorage upload document.pdf
```

After a successful upload, you'll receive:
- A share URL for your file
- A link to the blockchain verification record

**Output Example:**
```
🔐 File uploaded successfully!
📋 Share URL: https://valtstorage.cloud/share/V1234567
🔍 View blockchain record: https://valtstorage.cloud/valt.scan?address=V1234567

Your file is now securely stored with 7-layer protection on the decentralized network.
```

### Download

Download files that have been shared through Valtstorage.

```bash
valtstorage download <shareUrl>
```

**Example:**

```bash
valtstorage download https://valtstorage.cloud/share/V1234567
```

The file will be saved to your current directory with its original filename.

**Output Example:**
```
✅ File saved: document.pdf

Your file has been securely retrieved from the decentralized network.
```

### Scan

Verify a file's blockchain record to confirm its authenticity and timestamp.

```bash
valtstorage scan <shareUrl>
```

**Example:**

```bash
valtstorage scan https://valtstorage.cloud/share/V1234567
# Or use just the ID
valtstorage scan V1234567
```

This will open your browser to display the blockchain verification details, including:
- Upload timestamp
- File integrity verification
- Transaction records
- Proof of activity

## Interactive Mode

Valtstorage CLI can be run in interactive mode, providing a dedicated terminal interface with commands and tab completion.

```bash
# Start interactive mode
valtstorage

# You'll see a prompt
valtstorage > 
```

Available commands in interactive mode:
- `upload <file>` - Upload a file
- `download <shareUrl>` - Download a file
- `scan <shareUrl>` - Verify a file on blockchain
- `help` - Show available commands
- `clear` - Clear the terminal screen
- `exit` - Exit the CLI

## Configuration

Valtstorage CLI stores configuration in `~/.valtstorage/config.json`. You can customize:

- Terminal colors and themes
- API endpoints
- Interactive mode settings
- Timeout values

### Environment Variables

The following environment variables can be used to override configuration:

- `VALTSTORAGE_ENV` - Set environment ('production', 'development', 'demo')
- `VALTSTORAGE_API_URL` - Override the API URL
- `VALTSTORAGE_INTERACTIVE` - Enable/disable interactive mode ('true'/'false')

## Demo Mode

For testing purposes, you can use the CLI in demo mode which simulates operations without making actual API calls.

```bash
# Set environment variable to enable demo mode
export VALTSTORAGE_ENV=demo

# Now all commands will use simulated responses
valtstorage upload a.jpg
```

Demo mode is useful for:
- Testing the CLI without uploading real files
- Demonstrations and presentations
- Developing extensions or integrations

## Troubleshooting

### Common Issues

- **Connection Errors**: Ensure you have an active internet connection
- **Permission Denied**: Make sure you have write permissions in the current directory
- **Invalid Share URL**: Check that the share URL format is correct

### Getting Help

If you encounter issues not covered here, you can:
- Run `valtstorage --help` for command-line options
- Use `valtstorage help` in interactive mode

## Support

For questions or assistance, contact the developer via Telegram: @I_am_codeing

## Learn More

Visit [valtstorage.cloud](https://valtstorage.cloud) for more information about the platform, including:
- Security details about the 7-layer protection
- Blockchain integration specifications
- Enterprise solutions and API documentation
- Pricing and subscription options
