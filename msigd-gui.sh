#!/bin/bash
# MSI Monitor Control launcher
# Handles Wayland compatibility automatically

# Check if running on Wayland
if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the application
exec "$SCRIPT_DIR/msigd-gui" "$@"
