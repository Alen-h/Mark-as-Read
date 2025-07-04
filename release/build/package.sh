#!/bin/bash

# Chrome Extension Packaging Script
# This script builds and packages the Chrome extension for Chrome Web Store

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RELEASE_DIR="$PROJECT_ROOT/release"
BUILD_DIR="$RELEASE_DIR/build"
PACKAGES_DIR="$RELEASE_DIR/packages"
TEMP_DIR="$BUILD_DIR/temp"

# Get version from package.json
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")
PACKAGE_NAME="mark-as-read-v$VERSION"

echo -e "${BLUE}📦 Chrome Extension Packaging Script${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "Project: Mark as Read"
echo -e "Version: ${GREEN}$VERSION${NC}"
echo -e "Package: ${GREEN}$PACKAGE_NAME.zip${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
mkdir -p "$PACKAGES_DIR"

# Step 2: Build SCSS files
echo -e "${YELLOW}🔨 Building SCSS files...${NC}"
cd "$PROJECT_ROOT"
npm run build:all

# Step 3: Copy files to temp directory
echo -e "${YELLOW}📁 Copying files to temp directory...${NC}"

# Copy manifest.json
cp "$PROJECT_ROOT/manifest.json" "$TEMP_DIR/"

# Copy src directory (excluding SCSS source files)
cp -r "$PROJECT_ROOT/src" "$TEMP_DIR/"

# Remove SCSS source files from temp directory
rm -rf "$TEMP_DIR/src/styles"

# Copy assets
cp -r "$PROJECT_ROOT/assets" "$TEMP_DIR/"

# Copy README.md
cp "$PROJECT_ROOT/README.md" "$TEMP_DIR/"

# Step 4: Validate manifest version
echo -e "${YELLOW}🔍 Validating manifest version...${NC}"
MANIFEST_VERSION=$(node -p "require('$TEMP_DIR/manifest.json').version")
if [ "$VERSION" != "$MANIFEST_VERSION" ]; then
    echo -e "${RED}❌ Version mismatch! package.json: $VERSION, manifest.json: $MANIFEST_VERSION${NC}"
    exit 1
fi

# Step 5: Create package
echo -e "${YELLOW}📦 Creating package...${NC}"
cd "$TEMP_DIR"
zip -r "$PACKAGES_DIR/$PACKAGE_NAME.zip" ./* -x "*.DS_Store*" "*.git*" "node_modules/*" "*.scss" "*.map"

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

# Step 7: Display results
echo -e "${GREEN}✅ Package created successfully!${NC}"
echo -e "📍 Location: ${GREEN}$PACKAGES_DIR/$PACKAGE_NAME.zip${NC}"
echo -e "📏 Size: ${GREEN}$(du -h "$PACKAGES_DIR/$PACKAGE_NAME.zip" | cut -f1)${NC}"
echo ""
echo -e "${BLUE}🚀 Ready for Chrome Web Store upload!${NC}"

# Optional: List package contents
echo -e "${YELLOW}📋 Package contents:${NC}"
unzip -l "$PACKAGES_DIR/$PACKAGE_NAME.zip" | head -20 