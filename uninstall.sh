#!/bin/bash
# Uninstall MSI Monitor Control from the system

set -e

INSTALL_DIR="/opt/msigd-gui"
BIN_LINK="/usr/local/bin/msigd-gui"
DESKTOP_FILE="/usr/share/applications/msigd-gui.desktop"
ICON_DIR="/usr/share/icons/hicolor"

# Check for root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./uninstall.sh)"
    exit 1
fi

echo "Uninstalling MSI Monitor Control..."

# Remove binary and install directory
rm -rf "$INSTALL_DIR"

# Remove symlink
rm -f "$BIN_LINK"

# Remove icons
rm -f "$ICON_DIR/32x32/apps/msigd-gui.png"
rm -f "$ICON_DIR/128x128/apps/msigd-gui.png"
rm -f "$ICON_DIR/256x256/apps/msigd-gui.png"

# Remove desktop file
rm -f "$DESKTOP_FILE"

# Update icon cache
gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true

echo "Uninstallation complete!"
