#!/bin/bash
# Install MSI Monitor Control to the system

set -e

INSTALL_DIR="/opt/msigd-gui"
BIN_LINK="/usr/local/bin/msigd-gui"
DESKTOP_FILE="/usr/share/applications/msigd-gui.desktop"
ICON_DIR="/usr/share/icons/hicolor"

# Check for root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./install.sh)"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if binary exists
if [ ! -f "$SCRIPT_DIR/src-tauri/target/release/msigd-gui" ]; then
    echo "Error: Binary not found. Run 'npm run tauri build' first."
    exit 1
fi

echo "Installing MSI Monitor Control..."

# Create install directory
mkdir -p "$INSTALL_DIR"

# Copy binary
cp "$SCRIPT_DIR/src-tauri/target/release/msigd-gui" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/msigd-gui"

# Create launcher script
cat > "$INSTALL_DIR/launch.sh" << 'EOF'
#!/bin/bash
if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
fi
exec /opt/msigd-gui/msigd-gui "$@"
EOF
chmod +x "$INSTALL_DIR/launch.sh"

# Create symlink
ln -sf "$INSTALL_DIR/launch.sh" "$BIN_LINK"

# Install icons
for size in 32 128 256; do
    mkdir -p "$ICON_DIR/${size}x${size}/apps"
done
cp "$SCRIPT_DIR/src-tauri/icons/32x32.png" "$ICON_DIR/32x32/apps/msigd-gui.png"
cp "$SCRIPT_DIR/src-tauri/icons/128x128.png" "$ICON_DIR/128x128/apps/msigd-gui.png"
cp "$SCRIPT_DIR/src-tauri/icons/128x128@2x.png" "$ICON_DIR/256x256/apps/msigd-gui.png"

# Install desktop file
cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Name=MSI Monitor Control
Comment=Control MSI gaming monitor settings
Exec=msigd-gui
Icon=msigd-gui
Terminal=false
Type=Application
Categories=Utility;Settings;HardwareSettings;
Keywords=monitor;msi;display;brightness;led;mystic;
StartupNotify=true
EOF

# Update icon cache
gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true

echo "Installation complete!"
echo ""
echo "You can now run 'msigd-gui' from the terminal or find it in your application menu."
