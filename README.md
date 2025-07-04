# Mark as Read - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Coming%20Soon-blue)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-green)](https://github.com/Alen-h/Mark-as-Read)

A simple and efficient Chrome extension to help you mark and track visited web pages with a clean, minimal flat design.

## 🌟 Features

- ✅ **One-Click Marking**: Mark current page as read through the extension popup
- 🔍 **Visual Indicator**: Display "READ" badge on top-right corner of marked pages
- 📊 **Statistics**: View total count of read pages and history
- 🔄 **Real-time Sync**: Uses Chrome sync storage for cross-device synchronization
- 🎨 **Minimal Flat Design**: Clean, flat design with zero visual fatigue
- 📱 **Responsive**: Adapts to different screen sizes
- 🛠️ **SCSS Architecture**: Modular style management for easy maintenance and extension
- 🚀 **Manifest V3**: Built with the latest Chrome extension standards

## 📷 Screenshots

*Screenshots will be added here*

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
*Coming soon - Extension will be available on Chrome Web Store*

### Method 2: Developer Mode Installation

1. **Download the Extension**
   - Clone this repository: `git clone https://github.com/Alen-h/Mark-as-Read.git`
   - Or download the ZIP file and extract it

2. **Install Dependencies** (if developing)
   ```bash
   cd Mark-as-Read
   npm install
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the project folder
   - Extension installed successfully!

## 📖 Usage

### Mark Page as Read

1. Visit any webpage
2. Click the 📚 "Mark as Read" icon in the browser toolbar
3. Click "Mark as Read" button in the popup
4. A "READ" badge will appear on the top-right corner of the page

### Unmark Page

1. Click the extension icon on a marked page
2. Click "Unmark" button
3. The read badge will be removed

### View History

1. Click the extension icon
2. Click "View History" to see all marked pages
3. Browse through your reading history with timestamps

### View Statistics

The total count of read pages is displayed at the bottom of the extension popup.

## 🛠️ Technical Implementation

- **Manifest V3**: Uses the latest Chrome extension APIs and service workers
- **Storage Sync**: Uses `chrome.storage.sync` for cross-device synchronization
- **Content Scripts**: Injects read indicators into web pages using modern DOM APIs
- **SCSS Architecture**: Modular style management with theme variables and mixins
- **Minimal Flat Design**: Clean, flat design removing gradients and complex effects
- **Responsive Design**: Adapts to different screen sizes and resolutions
- **Modern JavaScript**: ES6+ features with proper error handling

## 📁 Project Structure

```
Mark as Read/
├── manifest.json          # Extension configuration (Manifest V3)
├── package.json           # Dependencies and build scripts
├── package-lock.json      # Locked dependency versions
├── LICENSE               # MIT License
├── PRIVACY-POLICY.md      # Privacy policy
├── privacy-policy.html    # Privacy policy HTML version
├── README.md             # This file
├── src/
│   ├── popup/
│   │   ├── popup.html     # Popup interface
│   │   └── popup.js       # Popup logic and event handlers
│   ├── history/
│   │   ├── history.html   # History page interface
│   │   └── history.js     # History page logic
│   ├── content/
│   │   └── content.js     # Content script for page injection
│   ├── background/
│   │   └── background.js  # Background service worker
│   └── styles/            # SCSS source files
│       ├── themes/
│       │   └── _variables.scss    # Theme variables and colors
│       ├── base/
│       │   └── _mixins.scss       # Common mixins and utilities
│       ├── components/
│       │   ├── _popup.scss        # Popup component styles
│       │   ├── _history.scss      # History component styles
│       │   └── _content.scss      # Content script component styles
│       ├── popup.scss     # Popup entry file
│       ├── history.scss   # History entry file
│       ├── content.scss   # Content script entry file
│       └── main.scss      # Main style entry
└── assets/
    └── icons/             # Icon files (16x16 to 1024x1024)
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        ├── icon64.png
        ├── icon128.png
        └── icon1024.png
```

## 🎨 Minimal Flat Design

This project follows minimal flat design principles focused on:

### Design Philosophy
- **Visual Simplicity**: Remove all unnecessary decorative effects
- **Cognitive Ease**: Reduce visual complexity and cognitive load
- **Content Focus**: Help users focus on core functionality, not interface decoration
- **Long-term Comfort**: Suitable for extended use with zero visual fatigue

## 🔧 Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Chrome browser (latest version)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alen-h/Mark-as-Read.git
   cd Mark-as-Read
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Development mode** (watch SCSS files)
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
# Development mode (watch SCSS files)
npm run dev

# Build all style files
npm run build

# Build individual components
npm run build:scss:popup
npm run build:scss:history
npm run build:scss:content

# Watch individual components
npm run watch:scss:popup
npm run watch:scss:history
npm run watch:scss:content

# Watch all components
npm run watch:all
```

### Testing

1. Load the extension in Chrome developer mode
2. Test all functionality manually
3. Check console for any errors
4. Verify across different websites

### Debugging

1. **Popup Issues**: Right-click the extension icon → "Inspect popup"
2. **Content Script Issues**: Open DevTools on any webpage
3. **Background Script Issues**: Go to `chrome://extensions/` → "Inspect views: service worker"

## 🔑 Permissions

- `storage`: Store read URL data locally and sync across devices
- `activeTab`: Get current active tab information
- `tabs`: Access tab information
- `notifications`: Show notifications to users
- `host_permissions`: Inject content scripts on all websites (`http://*/*`, `https://*/*`)

## 💾 Data Storage Format

```javascript
{
  "readUrls": {
    "https://example.com": {
      "title": "Example Site",
      "timestamp": 1640995200000,
      "domain": "example.com",
      "favicon": "https://example.com/favicon.ico"
    }
  }
}
```

## 🔒 Privacy

This extension respects your privacy:
- No data is sent to external servers
- All data is stored locally in your Chrome browser
- Sync feature uses Chrome's built-in sync (optional)
- No tracking or analytics
- See [Privacy Policy](PRIVACY-POLICY.md) for details

## 🐛 Troubleshooting

### Common Issues

1. **Extension not working**: Try reloading the extension in `chrome://extensions/`
2. **Styles not applied**: Run `npm run build` to compile SCSS files
3. **Sync not working**: Ensure Chrome sync is enabled in your browser
4. **Badge not showing**: Check if the website has conflicting CSS

### Getting Help

- Check the [Issues](https://github.com/Alen-h/Mark-as-Read/issues) page
- Create a new issue with detailed description
- Include Chrome version and error messages

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Changelog

### Version 1.0.0
- Initial release
- Basic marking functionality
- Minimal flat design implementation
- Cross-device sync support
- History page

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension API documentation
- SCSS and modern CSS practices
- Minimal design inspiration from various sources

---

**Made with ❤️ by [Alen Hu](https://github.com/Alen-h)**

*If you find this extension helpful, please consider giving it a ⭐ on GitHub!*