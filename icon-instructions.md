# Icon File Instructions

## 📋 Required Icon Sizes

The extension requires the following PNG icon sizes:
- `icon16.png` (16x16px)
- `icon32.png` (32x32px)  
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## 🎨 Icon Conversion Methods

### Method 1: Online Conversion
1. Open the `icons/icon.svg` file
2. Use an online SVG to PNG conversion tool (such as convertio.co or svgtopng.com)
3. Generate PNG files in 16x16, 32x32, 48x48, and 128x128 sizes respectively
4. Rename the generated files and place them in the `icons/` folder

### Method 2: Using Design Software
1. Open the SVG file in Figma, Adobe Illustrator, or Inkscape
2. Export as PNG format in different sizes
3. Save to the `icons/` folder

### Method 3: Using Command Line Tools (requires ImageMagick installation)
```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Convert to different sizes
convert icons/icon.svg -resize 16x16 icons/icon16.png
convert icons/icon.svg -resize 32x32 icons/icon32.png
convert icons/icon.svg -resize 48x48 icons/icon48.png
convert icons/icon.svg -resize 128x128 icons/icon128.png
```

## 🎯 Icon Design Description

The current SVG icon includes:
- Gradient background circle
- Book shape (representing reading)
- Green checkmark (representing "read" status)
- Clean, modern design style

You can also modify the colors and design elements in `icon.svg` as needed. 