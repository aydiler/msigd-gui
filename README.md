# MSI Monitor Control

A desktop GUI application for controlling MSI gaming monitors on Linux, built with Tauri 2.0 and Svelte 5.

![MSI Monitor Control](https://img.shields.io/badge/Platform-Linux-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![Svelte](https://img.shields.io/badge/Svelte-5-red)

## Features

- Detect connected MSI monitors
- Adjust brightness and contrast
- Control sharpness settings
- Set response time modes
- Toggle eye saver mode

## Prerequisites

- [msigd](https://github.com/coucouco/msigd) - MSI monitor control CLI tool
- Node.js 18+
- Rust 1.70+
- WebKitGTK 4.1 (for Linux)

### Install msigd

```bash
# Clone and build msigd
git clone https://github.com/coucouco/msigd.git
cd msigd
make
sudo make install
```

### Install System Dependencies (Arch Linux)

```bash
sudo pacman -S webkit2gtk-4.1 base-devel curl wget openssl
```

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/aydiler/msigd-gui.git
cd msigd-gui

# Install dependencies
npm install

# Build the application
npm run tauri build

# The binary will be at src-tauri/target/release/msigd-gui
```

### Development

```bash
# Run in development mode
npm run tauri dev
```

## Usage

```bash
# Run the application
WEBKIT_DISABLE_COMPOSITING_MODE=1 ./msigd-gui
```

The `WEBKIT_DISABLE_COMPOSITING_MODE=1` environment variable may be required on some Linux systems with Wayland.

## Tech Stack

- **Backend**: Tauri 2.0 (Rust)
- **Frontend**: Svelte 5 with Tailwind CSS
- **Build**: Vite
- **Monitor Control**: msigd CLI

## License

MIT
