# Release Management

This directory contains all files related to packaging and releasing the Chrome extension.

## Directory Structure

```
/release/
├── build/              # Build scripts and tools
│   └── package.sh      # Main packaging script
├── packages/           # Generated package files
│   └── *.zip          # Version-specific packages
├── store-assets/       # Chrome Web Store assets
│   ├── icons/         # Store icons
│   ├── screenshots/   # Store screenshots
│   └── descriptions/  # Store descriptions
└── changelog.md       # Version history
```

## Packaging Process

### Prerequisites
- Node.js installed
- npm dependencies installed (`npm install`)
- All SCSS files compiled

### Quick Start

1. **Using the shell script** (Recommended):
   ```bash
   chmod +x release/build/package.sh
   ./release/build/package.sh
   ```

2. **Using npm script**:
   ```bash
   npm run package
   ```

### What Gets Packaged

✅ **Included:**
- `manifest.json` - Extension manifest
- `src/` - All source files (JS, HTML, CSS)
- `assets/` - Icons and static assets
- `README.md` - Project documentation

❌ **Excluded:**
- `node_modules/` - Dependencies
- `src/styles/` - SCSS source files
- `.git/` - Version control files
- `.DS_Store` - System files
- `*.map` - Source maps
- Development files

### Package Output

The script creates a zip file in `/release/packages/` with the naming convention:
```
mark-as-read-v{version}.zip
```

### Chrome Web Store Submission

1. Build the package using the script above
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Upload the generated zip file
4. Fill in store listing details
5. Submit for review

## Version Management

- Update version in both `package.json` and `manifest.json`
- Update `changelog.md` with changes
- The packaging script validates version consistency
- Previous packages are preserved for rollback purposes

## Troubleshooting

### Common Issues

1. **Permission denied**: Make sure the script is executable
   ```bash
   chmod +x release/build/package.sh
   ```

2. **Node.js not found**: Ensure Node.js is installed and in PATH

3. **Version mismatch**: Ensure package.json and manifest.json have the same version

4. **SCSS not compiled**: Run `npm run build:all` before packaging

### Manual Packaging

If the script fails, you can manually package:

1. Run `npm run build:all` to compile SCSS
2. Create a new folder with:
   - `manifest.json`
   - `src/` (without `styles/` folder)
   - `assets/`
   - `README.md`
3. Zip the folder contents (not the folder itself)

## Best Practices

- Always test the extension locally before packaging
- Keep store assets updated in `/release/store-assets/`
- Document all changes in `changelog.md`
- Follow Chrome Web Store policies
- Test the packaged extension in a clean Chrome profile 