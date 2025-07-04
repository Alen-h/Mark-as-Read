# Mark as Read - Chrome Extension

A simple and efficient Chrome extension to help you mark and track visited web pages.

## 🌟 Features

- ✅ **One-Click Marking**: Mark current page as read through the extension popup
- 🔍 **Visual Indicator**: Display "READ" badge on top-right corner of marked pages
- 📊 **Statistics**: View total count of read pages
- 🔄 **Real-time Sync**: Uses Chrome sync storage for cross-device synchronization
- 🎨 **Minimal Flat Design**: Clean, flat design with zero visual fatigue
- 📱 **Responsive**: Adapts to different screen sizes
- 🛠️ **SCSS Architecture**: Modular style management for easy maintenance and extension

## 🚀 Installation

### Developer Mode Installation

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select this project folder
6. Extension installed successfully!

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

### View Statistics

The total count of read pages is displayed at the bottom of the extension popup.

## 🛠️ Technical Implementation

- **Manifest V3**: Uses the latest Chrome extension APIs
- **Storage Sync**: Uses `chrome.storage.sync` for cross-device synchronization
- **Content Scripts**: Injects read indicators into web pages
- **SCSS Architecture**: Modular style management with theme variables and mixins
- **Minimal Flat Design**: Clean, flat design removing gradients and complex effects
- **Responsive Design**: Adapts to different screen sizes and resolutions

## 📁 Project Structure

```
Mark as Read/
├── manifest.json          # Extension configuration
├── package.json           # Dependencies management
├── src/
│   ├── popup/
│   │   ├── popup.html     # Popup interface
│   │   ├── popup.js       # Popup logic
│   │   └── popup.css      # Popup styles (compiled from SCSS)
│   ├── history/
│   │   ├── history.html   # History page
│   │   ├── history.js     # History page logic
│   │   └── history.css    # History page styles (compiled from SCSS)
│   ├── content/
│   │   ├── content.js     # Content script
│   │   └── styles.css     # Content script styles (compiled from SCSS)
│   ├── background/
│   │   └── background.js  # Background service worker
│   └── styles/            # SCSS source files
│       ├── themes/
│       │   └── _variables.scss    # Theme variables
│       ├── base/
│       │   └── _mixins.scss       # Common mixins
│       ├── components/
│       │   ├── _popup.scss        # Popup component styles
│       │   ├── _history.scss      # History component styles
│       │   └── _content.scss      # Content script component styles
│       ├── popup.scss     # Popup entry file
│       ├── history.scss   # History entry file
│       ├── content.scss   # Content script entry file
│       └── main.scss      # Main style entry
├── assets/
│   └── icons/             # Icon files
├── docs/
│   └── design-system.md  # Design system documentation
└── README.md              # Project documentation
```

## 🎨 Minimal Flat Design

This project follows minimal flat design principles. For detailed information, see [Design System Documentation](docs/design-system.md).

### Design Philosophy
- **Visual Simplicity**: Remove all unnecessary decorative effects
- **Cognitive Ease**: Reduce visual complexity and cognitive load
- **Content Focus**: Help users focus on core functionality, not interface decoration
- **Long-term Comfort**: Suitable for extended use with zero visual fatigue

## 🔧 Development

### Install Dependencies

```bash
npm install
```

### Development Workflow

```bash
# Development mode (watch SCSS files)
npm run dev

# Build all style files
npm run build

# Build individual components
npm run build:scss:popup
npm run build:scss:history
npm run build:scss:content
```

### Permissions

- `storage`: Store read URL data
- `activeTab`: Get current active tab information
- `host_permissions`: Inject content scripts on all websites

### Data Storage Format

```javascript
{
  "readUrls": {
    "https://example.com": {
      "title": "Example Site",
      "timestamp": 1640995200000,
      "domain": "example.com"
    }
  }
}
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

---

Made with ❤️ by Alen Hu