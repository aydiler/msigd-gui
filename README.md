# MSI Monitor Control

A modern desktop GUI application for controlling MSI gaming monitors on Linux. Built with [Tauri 2.0](https://tauri.app/) (Rust backend) and [Svelte 5](https://svelte.dev/) (TypeScript frontend).

![MSI Monitor Control](https://img.shields.io/badge/Platform-Linux-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![Svelte](https://img.shields.io/badge/Svelte-5-red)

![Display Tab](screenshots/display-tab.png)

## Features

- **Display Settings** - Brightness, contrast, sharpness, response time, eye saver mode
- **Color Management** - Color temperature presets (Cool/Normal/Warm) and RGB fine-tuning
- **LED Control** - MSI Mystic Light RGB modes (Static, Breathing, Rainbow, etc.)
- **Advanced Options** - HDCR, image enhancement, refresh rate OSD
- **Multi-Monitor Support** - Switch between connected MSI monitors
- **Settings Persistence** - All settings cached locally and survive app restarts

## Screenshots

<table>
  <tr>
    <td><img src="screenshots/display-tab.png" alt="Display Tab" width="400"/><br/><em>Display - Picture & Performance</em></td>
    <td><img src="screenshots/color-tab.png" alt="Color Tab" width="400"/><br/><em>Color - Temperature & RGB</em></td>
  </tr>
  <tr>
    <td><img src="screenshots/led-tab.png" alt="LED Tab" width="400"/><br/><em>LED - Mystic Light Control</em></td>
    <td><img src="screenshots/advanced-tab.png" alt="Advanced Tab" width="400"/><br/><em>Advanced - HDCR & Monitor Info</em></td>
  </tr>
</table>

## Requirements

- Linux (tested on Arch Linux with KDE Plasma)
- [msigd](https://github.com/couriersud/msigd) CLI tool installed
- USB connection to MSI monitor
- Proper udev rules for HID access

## Installation

### Prerequisites

**1. Install msigd CLI tool:**
```bash
git clone https://github.com/couriersud/msigd.git
cd msigd
make
sudo make install
```

**2. Set up udev rules** (for USB access without root):
```bash
sudo cp 99-msigd.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules
```

**3. System dependencies:**
```bash
# Arch Linux
sudo pacman -S webkit2gtk-4.1

# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0
```

### Arch Linux (AUR)

```bash
# From AUR (build from source)
yay -S msigd-gui

# Or binary package
yay -S msigd-gui-bin
```

### Debian/Ubuntu (.deb)

```bash
# Download from GitHub releases
wget https://github.com/aydiler/msigd-gui/releases/download/v1.0.0/MSI.Monitor.Control_1.0.0_amd64.deb
sudo dpkg -i "MSI Monitor Control_1.0.0_amd64.deb"
```

### Flatpak

```bash
# Install from Flathub (when available)
flatpak install flathub com.msigd.gui

# Or build locally
cd flatpak
flatpak-builder --user --install build com.msigd.gui.yml
```

### Snap

```bash
# Install from Snap Store (when available)
sudo snap install msigd-gui

# Or build locally
cd snap
snapcraft
sudo snap install msigd-gui_1.0.0_amd64.snap --dangerous
```

### Build from Source

```bash
git clone https://github.com/aydiler/msigd-gui.git
cd msigd-gui
npm install
npm run tauri build

# Install system-wide
sudo ./install.sh

# Or run directly
./msigd-gui.sh
```

### Uninstall

```bash
sudo ./uninstall.sh
```

## Development

```bash
npm install           # Install dependencies
npm run tauri dev     # Run with hot reload
npm test              # Run E2E tests
npm run test:ui       # Run tests with UI
```

## Architecture

```
Svelte UI → Tauri IPC → Rust Commands → msigd CLI → Monitor Hardware
```

| Layer | Technology |
|-------|------------|
| Frontend | Svelte 5, TypeScript, Vite |
| Backend | Rust, Tauri 2.0 |
| Testing | Playwright |
| Monitor API | msigd CLI |

## Supported Monitors

Any MSI monitor supported by [msigd](https://github.com/couriersud/msigd):
- MSI MAG series (MAG274QRF-QD, MAG271CQR, etc.)
- MSI MPG series
- MSI Optix series

## License

MIT

## Credits

- [msigd](https://github.com/couriersud/msigd) - CLI tool for MSI monitor control
- [Tauri](https://tauri.app/) - Desktop app framework
- [Svelte](https://svelte.dev/) - Frontend framework
