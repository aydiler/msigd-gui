# Hardware Tests for MSI Monitor Control

Real end-to-end tests that interact with the actual Tauri app and your MSI monitor.

## Requirements

- **KDE Plasma** (for kdotool)
- **kdotool** - KDE's window automation tool
- **spectacle** - KDE screenshot tool (optional, for verification)
- **MSI monitor** connected via USB

## Usage

```bash
# Run all hardware tests
./tests/hardware/run-tests.sh

# Run specific test suites
./tests/hardware/run-tests.sh display   # Brightness, contrast, eye saver
./tests/hardware/run-tests.sh color     # Color presets
./tests/hardware/run-tests.sh led       # LED modes
./tests/hardware/run-tests.sh nav       # Tab navigation only
```

Or use npm scripts:

```bash
npm run test:hardware          # Run all hardware tests
npm run test:hardware:display  # Display tests only
```

## What Gets Tested

| Test | What It Does | Verify On Monitor |
|------|--------------|-------------------|
| App loads | Checks window appears | Window visible |
| Tab navigation | Clicks all tabs | UI updates |
| Brightness slider | Drags slider right | Screen gets brighter |
| Contrast slider | Drags slider | Contrast changes |
| Eye Saver toggle | Clicks toggle | Warm color filter |
| Color preset | Changes to "Warm" | Colors shift warmer |
| LED mode | Sets to "Static" | LEDs change |

## Screenshots

Screenshots are saved to `tests/hardware/screenshots/` with timestamps:

```
screenshots/
├── 20260120_143052_app_loaded.png
├── 20260120_143052_brightness_before.png
├── 20260120_143052_brightness_after.png
└── ...
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   run-tests.sh                                              │
│        │                                                    │
│        ├── 1. Start: npm run tauri dev                      │
│        │                                                    │
│        ├── 2. Find window: kdotool search                   │
│        │                                                    │
│        ├── 3. Interact: kdotool click/mousemove             │
│        │        │                                           │
│        │        ▼                                           │
│        │   ┌─────────────┐                                  │
│        │   │ Tauri App   │ ──► USB ──► MSI Monitor          │
│        │   └─────────────┘                                  │
│        │                                                    │
│        └── 4. Screenshot: spectacle                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Customizing Tests

The test script uses relative coordinates within the window. If your window size differs, you may need to adjust positions in `run-tests.sh`:

```bash
# Slider positions (relative to window)
local slider_y=180        # Y position of brightness slider
local slider_start_x=240  # Start X (center)
local slider_end_x=400    # End X (drag target)
```

## Troubleshooting

### "Could not find app window"
- Make sure no other "MSI Monitor Control" window is open
- Try running `kdotool search --name "MSI Monitor Control"` manually

### Clicks are in wrong positions
- Window size may differ from expected 480x680
- Adjust coordinates in the test script
- Use screenshots to debug positions

### "kdotool not found"
```bash
# Install on Arch Linux
sudo pacman -S kdotool
```

### Tests pass but monitor doesn't change
- Check USB connection
- Verify monitor is detected: run app manually and check dropdown
- Check console for errors: `npm run tauri dev` in terminal

## CI/CD Note

These tests require:
1. A physical display (or Xvfb)
2. A real MSI monitor connected

They are **not suitable for CI/CD** - use Playwright tests for automated pipelines.
