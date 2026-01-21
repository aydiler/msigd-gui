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
WEBKIT_DISABLE_COMPOSITING_MODE=1 ./msigd-gui  # Run on Wayland

# Testing
npm test                      # Playwright E2E tests (headless)
npm run test:ui              # Playwright UI test runner
npm run test:headed          # Playwright with browser visible
npm run test:wdio            # WebdriverIO interactive tests
npm run test:hardware        # Hardware tests (requires msigd + monitor)
```

## Architecture

### Data Flow

```
Svelte Component → API (monitor.ts) → Tauri invoke() → Rust Command Handler
    → MsigdExecutor (spawns msigd CLI) → Monitor Hardware
```

### Key Directories

- `src/lib/views/` - Tab view components (Display, Color, LED, Advanced)
- `src/lib/state/` - Svelte 5 rune-based state (MonitorState, UIState singletons)
- `src/lib/api/monitor.ts` - Tauri command bindings (18 monitor commands)
- `src-tauri/src/commands/monitor.rs` - Tauri handlers with validation
- `src-tauri/src/msigd/executor.rs` - CLI process spawning
- `src-tauri/src/msigd/parser.rs` - msigd output parsing
- `src-tauri/src/msigd/types.rs` - Rust data structures and enums

### State Management

Svelte 5 `$state` rune with singleton pattern:
- `monitorState` - Monitor list, selected monitor, settings
- `uiState` - Active tab, toast notifications

### msigd Output Parsing

- Format: `key: value` (colon-separated, lowercase keys)
- RGB format: `r,g,b` (commas, not colons)
- `refresh_display` in msigd maps to `refreshRateDisplay` in app

## Implementation Notes

### Adding a New Monitor Setting

1. Add field to `MonitorSettings` in `src-tauri/src/msigd/types.rs`
2. Update parser in `src-tauri/src/msigd/parser.rs`
3. Add command in `src-tauri/src/commands/monitor.rs`
4. Add API binding in `src/lib/api/monitor.ts`
5. Add UI control in appropriate view component

### Linux-Specific

- Forces X11 backend: `GDK_BACKEND=x11` (set in lib.rs)
- WebKit compositing disabled for Wayland compatibility
- Vite targets Safari 13 (WebKit) on Linux

### Tauri 2.0

- Global Tauri API enabled (`withGlobalTauri: true`)
- API bindings check `window.__TAURI__` with npm import fallback
- CSP disabled for simplicity

### UI Patterns

- Sliders use 150ms debounce to prevent flooding msigd
- Reusable components: Slider, Toggle, Select (in `src/lib/components/`)
- Dark theme using Tailwind (base: #111827)
