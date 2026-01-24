# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop GUI application for controlling MSI gaming monitors on Linux. Built with Tauri 2.0 (Rust backend) and Svelte 5 (TypeScript frontend). Interfaces with the `msigd` CLI tool to communicate with monitor hardware via USB/HID.

## Commands

```bash
# Development
npm install                    # Install dependencies
npm run tauri dev             # Run app with hot reload (frontend: :5173)

# Production
npm run tauri build           # Build optimized binary → src-tauri/target/release/msigd-gui
./msigd-gui.sh                # Run with Wayland auto-detection

# Testing
npm test                      # Playwright E2E tests (headless)
npm run test:ui              # Playwright UI test runner
npm run test:headed          # Playwright with browser visible
```

## Architecture

### Data Flow

```
Svelte Component → API (monitor.ts) → Tauri invoke() → Rust Command Handler
    → MsigdExecutor (spawns msigd CLI) → Monitor Hardware
```

### Key Files

| Path | Purpose |
|------|---------|
| `src/lib/state/monitors.svelte.ts` | Singleton state with cache-first loading |
| `src/lib/api/store.ts` | Tauri Store plugin for persistence |
| `src/lib/api/monitor.ts` | Tauri command bindings |
| `src-tauri/src/msigd/executor.rs` | CLI process spawning |
| `src-tauri/src/msigd/parser.rs` | msigd output parsing |

### State Management

Svelte 5 `$state` rune with singleton pattern:
- `monitorState` - Monitor list, selected monitor, settings, cache state
- `uiState` - Active tab, toast notifications

**Cache-first pattern**: When switching monitors, cached settings are used as source of truth. Hardware is only queried when no cache exists.

**Race condition protection**: `loadRequestId` counter prevents stale responses from overwriting newer data during rapid monitor switching.

### Persistence Layer

Settings persist via Tauri Store plugin (`@tauri-apps/plugin-store`):
- File: `settings.json` in app data directory
- Stores: selected monitor ID, active tab, per-monitor settings cache
- Cache key: monitor ID → `{ settings, cachedAt }`

### Write-Only Settings (Frontend-Only)

LED settings (`ledMode`, `ledColor`, `ledColor2`) and `rgb_led` are **not queryable** from monitor hardware - msigd can only write them. These are stored only in the frontend cache and preserved across hardware refreshes.

### UI Tabs

The app organizes settings into 6 tabs:

| Tab | View File | Settings |
|-----|-----------|----------|
| Display | `DisplayView.svelte` | brightness, contrast, sharpness, response_time, eye_saver, screen_size, zero_latency |
| Color | `ColorView.svelte` | color_preset, color_rgb, night_vision, black_tuner, image_enhancement |
| Performance | `PerformanceView.svelte` | hdcr, free_sync, game_mode, pro_mode |
| OSD | `OSDView.svelte` | osd_transparency, osd_timeout, refresh_display, refresh_position, screen_info, screen_assistance, alarm_clock, alarm_position |
| Input | `InputView.svelte` | input, auto_scan, power_button, hdmi_cec, kvm, audio_source, sound_enable |
| LED | `LEDView.svelte` | mystic_light, rgb_led |

### msigd Output Parsing

- Format: `key: value` (colon-separated, lowercase keys)
- RGB format: `r,g,b` (commas, not colons)
- `refresh_display` in msigd maps to `refreshRateDisplay` in app

## Implementation Notes

### Adding a New Monitor Setting

1. Add field to `MonitorSettings` in `src-tauri/src/msigd/types.rs`
2. Update parser in `src-tauri/src/msigd/parser.rs`
3. Add command in `src-tauri/src/commands/monitor.rs`
4. Register command in `src-tauri/src/lib.rs` invoke_handler
5. Add TypeScript type in `src/lib/types.ts`
6. Add API binding in `src/lib/api/monitor.ts`
7. Add UI control in appropriate view component
8. If setting is write-only (like LED), add default in `getMonitorSettings()` and preserve in `refreshFromHardware()`

### Handler Pattern

All view handlers must:
1. Call Tauri API to set hardware value
2. `await monitorState.updateSetting()` to persist to cache
3. Show toast on error

### Linux-Specific

- Forces X11 backend: `GDK_BACKEND=x11` (set in lib.rs)
- WebKit compositing disabled for Wayland: `WEBKIT_DISABLE_COMPOSITING_MODE=1`
- Vite targets Safari 13 (WebKit) on Linux

### UI Patterns

- Sliders use 150ms debounce with flush-on-destroy to prevent losing final value
- Reusable components: Slider, Toggle, Select (in `src/lib/components/`)

## Packaging

| Format | Location |
|--------|----------|
| AUR | `aur/PKGBUILD`, `aur/PKGBUILD-bin` |
| Snap | `snap/snapcraft.yaml` |
| Deb | Built via `npm run tauri build` |
