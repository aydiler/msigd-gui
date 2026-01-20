# MSI Gaming Device GUI - Tauri + Rust Implementation Plan

> **Updated with Tauri 2.0 and Svelte 5 best practices from official documentation**

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture](#4-architecture)
5. [Rust Backend Implementation](#5-rust-backend-implementation)
6. [Frontend Implementation (Svelte 5)](#6-frontend-implementation-svelte-5)
7. [Implementation Phases](#7-implementation-phases)
8. [Build & Deployment](#8-build--deployment)
9. [Testing Strategy](#9-testing-strategy)
10. [Security Considerations](#10-security-considerations)

---

## 1. Project Overview

### 1.1 Purpose

Create a cross-platform GUI application to control MSI gaming monitors via the existing `msigd` CLI tool. The GUI will provide an intuitive interface for adjusting display settings, LED lighting (Mystic Light), and advanced monitor configurations.

### 1.2 Goals

- **User-friendly interface** for all msigd functionality
- **Cross-platform support** (Linux, Windows, potentially macOS)
- **Lightweight** (~10-15MB bundle, 30-50MB RAM)
- **Real-time feedback** when changing settings
- **Multi-monitor support** with easy switching

### 1.3 Target Features

| Category | Features |
|----------|----------|
| **Display** | Brightness, Contrast, Sharpness, Response Time, Eye Saver |
| **Color** | Color Preset, Custom RGB, Individual R/G/B |
| **LED** | Mystic Light modes (breathing, rainbow, meteor, etc.) |
| **Advanced** | HDCR, Screen Assistance, OSD Settings, Alarm |
| **System** | Monitor Selection, Device Info, Settings Profiles |

---

## 2. Technology Stack

### 2.1 Core Technologies

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| **Framework** | Tauri | 2.x | Lightweight, Rust backend, web frontend |
| **Backend** | Rust | 1.75+ | Type safety, performance, Tauri integration |
| **Frontend** | Svelte | 5.x | Runes reactivity, smallest bundle, excellent DX |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, customizable dark theme |
| **Build Tool** | Vite | 5.x | Fast HMR, modern bundling |
| **Shell Plugin** | tauri-plugin-shell | 2.x | Subprocess execution |

### 2.2 Why Tauri 2.0 + Svelte 5?

**Tauri 2.0 Benefits:**
- 5-10MB bundle size (vs 100MB+ Electron)
- Revamped IPC using custom protocols (faster than v1)
- New Channel API for streaming data from Rust to frontend
- Built-in capabilities and permissions system
- Cross-platform from single codebase
- Auto-updater support

**Svelte 5 Benefits:**
- New runes system (`$state`, `$derived`, `$effect`) for fine-grained reactivity
- Smallest bundle size among frameworks
- No virtual DOM overhead
- TypeScript support
- Simpler, more explicit component syntax

### 2.3 Dependencies

**Rust (src-tauri/Cargo.toml):**
```toml
[package]
name = "msigd-gui"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["sync"] }
thiserror = "1"

[build-dependencies]
tauri-build = { version = "2", features = [] }
```

**Frontend (package.json):**
```json
{
  "name": "msigd-gui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "svelte": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0"
  }
}
```

---

## 3. Project Structure

```
msigd-gui/
├── documentation/              # Project documentation
│   └── TAURI_IMPLEMENTATION_PLAN.md
│
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── main.rs            # Tauri entry point
│   │   ├── lib.rs             # Library root with command registration
│   │   ├── commands/          # Tauri command handlers
│   │   │   ├── mod.rs
│   │   │   ├── monitor.rs     # Monitor listing/selection
│   │   │   ├── display.rs     # Display settings
│   │   │   ├── color.rs       # Color controls
│   │   │   ├── led.rs         # Mystic Light controls
│   │   │   └── advanced.rs    # Advanced features
│   │   ├── msigd/             # msigd CLI wrapper
│   │   │   ├── mod.rs
│   │   │   ├── executor.rs    # Command execution
│   │   │   ├── parser.rs      # Output parsing
│   │   │   └── types.rs       # Data structures
│   │   ├── state.rs           # Application state management
│   │   └── error.rs           # Error types
│   ├── capabilities/          # Tauri 2.0 capability files
│   │   └── default.json
│   ├── Cargo.toml
│   ├── tauri.conf.json        # Tauri configuration
│   └── build.rs
│
├── src/                        # Frontend (Svelte 5)
│   ├── lib/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Slider.svelte
│   │   │   ├── Toggle.svelte
│   │   │   ├── Select.svelte
│   │   │   ├── ColorPicker.svelte
│   │   │   ├── MonitorCard.svelte
│   │   │   └── SettingsGroup.svelte
│   │   ├── views/             # Main view components
│   │   │   ├── DisplayView.svelte
│   │   │   ├── ColorView.svelte
│   │   │   ├── LedView.svelte
│   │   │   └── AdvancedView.svelte
│   │   ├── state/             # Svelte 5 runes state (.svelte.ts files)
│   │   │   ├── monitors.svelte.ts
│   │   │   ├── settings.svelte.ts
│   │   │   └── ui.svelte.ts
│   │   ├── api/               # Tauri command bindings
│   │   │   ├── monitor.ts
│   │   │   ├── display.ts
│   │   │   ├── color.ts
│   │   │   └── led.ts
│   │   └── types.ts           # TypeScript type definitions
│   ├── App.svelte             # Root component
│   ├── main.ts                # Entry point
│   └── app.css                # Global styles + Tailwind
│
├── static/                     # Static assets
│   └── icons/
│
├── index.html
├── package.json
├── svelte.config.js
├── vite.config.ts
└── README.md
```

---

## 4. Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri 2.0 Application                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │
│  │   Frontend (WebView)     │   │      Rust Backend           │ │
│  │                          │   │                             │ │
│  │  ┌───────────────────┐  │   │  ┌───────────────────────┐ │ │
│  │  │  Svelte 5 UI      │  │◄─►│  │  Tauri Commands       │ │ │
│  │  │  ($state runes)   │  │IPC│  │  (async + Result<T,E>)│ │ │
│  │  └───────────────────┘  │   │  └───────────┬───────────┘ │ │
│  │                          │   │              │             │ │
│  │  ┌───────────────────┐  │   │  ┌───────────▼───────────┐ │ │
│  │  │ Event Listeners   │◄─┼───┼──│  Event Emitter        │ │ │
│  │  │ (listen API)      │  │   │  │  (app.emit)           │ │ │
│  │  └───────────────────┘  │   │  └───────────────────────┘ │ │
│  │                          │   │                             │ │
│  │  ┌───────────────────┐  │   │  ┌───────────────────────┐ │ │
│  │  │ Channel Receivers │◄─┼───┼──│  Channels (streaming) │ │ │
│  │  │ (for progress)    │  │   │  │  (fast ordered data)  │ │ │
│  │  └───────────────────┘  │   │  └───────────┬───────────┘ │ │
│  └─────────────────────────┘   │              │             │ │
│                                 │  ┌───────────▼───────────┐ │ │
│                                 │  │  State (Mutex<T>)     │ │ │
│                                 │  │  (shared app state)   │ │ │
│                                 │  └───────────┬───────────┘ │ │
│                                 │              │             │ │
│                                 │  ┌───────────▼───────────┐ │ │
│                                 │  │  Shell Plugin         │ │ │
│                                 │  │  (subprocess exec)    │ │ │
│                                 │  └───────────┬───────────┘ │ │
│                                 └──────────────┼─────────────┘ │
└────────────────────────────────────────────────┼───────────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │   msigd CLI Binary     │
                                    │   /home/ahmet/msigd/   │
                                    └────────────┬───────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │   MSI Monitor (USB)    │
                                    └────────────────────────┘
```

### 4.2 Communication Patterns (Tauri 2.0)

Tauri 2.0 provides three main communication patterns:

| Pattern | Use Case | Direction | Performance |
|---------|----------|-----------|-------------|
| **Commands** | Request/Response | Frontend → Backend → Frontend | Standard IPC |
| **Events** | Notifications | Backend → Frontend (broadcast) | Good for small data |
| **Channels** | Streaming data | Backend → Frontend (ordered) | Optimized for throughput |

**When to use each:**
- **Commands:** Getting/setting monitor values
- **Events:** Monitor connect/disconnect notifications
- **Channels:** Progress updates during long operations

### 4.3 Data Flow

```
User Action (Slider drag)
      │
      ▼
Svelte Component ($state update)
      │
      ▼
Debounced API Call (invoke)
      │
      ▼
Rust Command Handler (async fn)
      │
      ▼
Shell Plugin (execute subprocess)
      │
      ▼
msigd CLI → MSI Monitor
      │
      ▼
Parse Output → Return Result<T, String>
      │
      ▼
Update $state → Reactive UI Update
```

---

## 5. Rust Backend Implementation

### 5.1 Error Handling (Tauri 2.0 Best Practice)

```rust
// src-tauri/src/error.rs

use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MsigdError {
    #[error("Failed to execute msigd: {0}")]
    ExecutionFailed(String),

    #[error("Command failed: {0}")]
    CommandFailed(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Invalid value: {0}")]
    InvalidValue(String),

    #[error("Monitor not found: {0}")]
    MonitorNotFound(String),
}

// Tauri 2.0 requires serializable errors for async commands
impl Serialize for MsigdError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
```

### 5.2 Application State (Tauri 2.0 Pattern)

```rust
// src-tauri/src/state.rs

use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use crate::msigd::types::{Monitor, MonitorSettings};

/// Application state managed by Tauri
/// Use Mutex for thread-safe access in async commands
#[derive(Default)]
pub struct AppState {
    pub monitors: Mutex<Vec<Monitor>>,
    pub cached_settings: Mutex<Option<MonitorSettings>>,
    pub selected_monitor: Mutex<Option<String>>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
```

### 5.3 msigd Wrapper Types

```rust
// src-tauri/src/msigd/types.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Monitor {
    pub id: String,
    pub serial: String,
    pub model: String,
    pub firmware: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorSettings {
    pub brightness: u8,
    pub contrast: u8,
    pub sharpness: u8,
    pub response_time: ResponseTime,
    pub eye_saver: bool,
    pub image_enhancement: ImageEnhancement,
    pub color_preset: ColorPreset,
    pub color_rgb: ColorRgb,
    pub hdcr: bool,
    pub refresh_rate_display: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ResponseTime {
    Normal,
    Fast,
    Fastest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ImageEnhancement {
    Off,
    Weak,
    Medium,
    Strong,
    Strongest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ColorPreset {
    Cool,
    Normal,
    Warm,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColorRgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MysticLightConfig {
    pub led_group: String,
    pub mode: MysticLightMode,
    pub colors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum MysticLightMode {
    Off,
    Static,
    Breathing,
    Blinking,
    Flashing,
    DoubleFlashing,
    Lightning,
    Rainbow,
    Meteor,
    RainbowGradient,
}
```

### 5.4 Shell Plugin Executor (Tauri 2.0)

```rust
// src-tauri/src/msigd/executor.rs

use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;
use crate::error::MsigdError;

const MSIGD_PATH: &str = "/home/ahmet/msigd/msigd";

pub struct MsigdExecutor;

impl MsigdExecutor {
    /// Execute msigd using Tauri's shell plugin (Tauri 2.0 pattern)
    pub async fn execute(app: &AppHandle, args: Vec<&str>) -> Result<String, MsigdError> {
        let output = app
            .shell()
            .command(MSIGD_PATH)
            .args(args)
            .output()
            .await
            .map_err(|e| MsigdError::ExecutionFailed(e.to_string()))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(MsigdError::CommandFailed(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ))
        }
    }

    /// List all connected monitors
    pub async fn list_monitors(app: &AppHandle) -> Result<String, MsigdError> {
        Self::execute(app, vec!["--list"]).await
    }

    /// Query settings for a specific monitor
    pub async fn query_monitor(app: &AppHandle, monitor_id: &str) -> Result<String, MsigdError> {
        Self::execute(app, vec!["--monitor", monitor_id, "--query", "--numeric"]).await
    }

    /// Set a numeric setting
    pub async fn set_numeric(
        app: &AppHandle,
        monitor_id: &str,
        setting: &str,
        value: u8,
    ) -> Result<String, MsigdError> {
        let value_str = value.to_string();
        let flag = format!("--{}", setting);
        Self::execute(app, vec!["--monitor", monitor_id, &flag, &value_str]).await
    }

    /// Set an enum setting
    pub async fn set_enum(
        app: &AppHandle,
        monitor_id: &str,
        setting: &str,
        value: &str,
    ) -> Result<String, MsigdError> {
        let flag = format!("--{}", setting);
        Self::execute(app, vec!["--monitor", monitor_id, &flag, value]).await
    }

    /// Set Mystic Light configuration
    pub async fn set_mystic_light(
        app: &AppHandle,
        monitor_id: &str,
        config: &str,
    ) -> Result<String, MsigdError> {
        Self::execute(app, vec!["--monitor", monitor_id, "--mystic", config]).await
    }
}
```

### 5.5 Tauri Commands (Async with Result)

```rust
// src-tauri/src/commands/monitor.rs

use tauri::{command, AppHandle, State};
use crate::error::MsigdError;
use crate::msigd::{executor::MsigdExecutor, parser::MsigdParser, types::*};
use crate::state::AppState;

/// List all connected monitors
/// Tauri 2.0: async commands must return Result<T, E> where E is serializable
#[command]
pub async fn list_monitors(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<Vec<Monitor>, MsigdError> {
    let output = MsigdExecutor::list_monitors(&app).await?;
    let monitors = MsigdParser::parse_monitor_list(&output)?;

    // Cache monitors in state
    let mut cached = state.monitors.lock().unwrap();
    *cached = monitors.clone();

    Ok(monitors)
}

/// Get settings for a specific monitor
#[command]
pub async fn get_monitor_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    monitor_id: String,
) -> Result<MonitorSettings, MsigdError> {
    let output = MsigdExecutor::query_monitor(&app, &monitor_id).await?;
    let settings = MsigdParser::parse_settings(&output)?;

    // Cache settings
    let mut cached = state.cached_settings.lock().unwrap();
    *cached = Some(settings.clone());

    Ok(settings)
}

/// Select a monitor as active
#[command]
pub async fn select_monitor(
    state: State<'_, AppState>,
    monitor_id: String,
) -> Result<(), MsigdError> {
    let mut selected = state.selected_monitor.lock().unwrap();
    *selected = Some(monitor_id);
    Ok(())
}
```

```rust
// src-tauri/src/commands/display.rs

use tauri::{command, AppHandle};
use crate::error::MsigdError;
use crate::msigd::executor::MsigdExecutor;

/// Set brightness (0-100)
#[command]
pub async fn set_brightness(
    app: AppHandle,
    monitor_id: String,
    value: u8,
) -> Result<(), MsigdError> {
    if value > 100 {
        return Err(MsigdError::InvalidValue(
            "Brightness must be 0-100".to_string(),
        ));
    }

    MsigdExecutor::set_numeric(&app, &monitor_id, "brightness", value).await?;
    Ok(())
}

/// Set contrast (0-100)
#[command]
pub async fn set_contrast(
    app: AppHandle,
    monitor_id: String,
    value: u8,
) -> Result<(), MsigdError> {
    if value > 100 {
        return Err(MsigdError::InvalidValue(
            "Contrast must be 0-100".to_string(),
        ));
    }

    MsigdExecutor::set_numeric(&app, &monitor_id, "contrast", value).await?;
    Ok(())
}

/// Set sharpness (0-5)
#[command]
pub async fn set_sharpness(
    app: AppHandle,
    monitor_id: String,
    value: u8,
) -> Result<(), MsigdError> {
    if value > 5 {
        return Err(MsigdError::InvalidValue(
            "Sharpness must be 0-5".to_string(),
        ));
    }

    MsigdExecutor::set_numeric(&app, &monitor_id, "sharpness", value).await?;
    Ok(())
}

/// Set response time
#[command]
pub async fn set_response_time(
    app: AppHandle,
    monitor_id: String,
    value: String,
) -> Result<(), MsigdError> {
    MsigdExecutor::set_enum(&app, &monitor_id, "response_time", &value).await?;
    Ok(())
}

/// Set eye saver mode
#[command]
pub async fn set_eye_saver(
    app: AppHandle,
    monitor_id: String,
    enabled: bool,
) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&app, &monitor_id, "eye_saver", value).await?;
    Ok(())
}
```

### 5.6 Event Emission (Backend → Frontend)

```rust
// src-tauri/src/commands/events.rs

use tauri::{AppHandle, Emitter};
use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorEvent {
    pub event_type: String,
    pub monitor_id: Option<String>,
    pub message: String,
}

/// Emit a monitor-related event to the frontend
pub fn emit_monitor_event(app: &AppHandle, event: MonitorEvent) {
    app.emit("monitor-event", event).unwrap_or_else(|e| {
        eprintln!("Failed to emit event: {}", e);
    });
}

/// Example: emit when a setting changes successfully
pub fn emit_setting_changed(app: &AppHandle, setting: &str, value: &str) {
    app.emit("setting-changed", serde_json::json!({
        "setting": setting,
        "value": value
    })).unwrap_or_default();
}
```

### 5.7 Channels for Streaming (Tauri 2.0 Feature)

```rust
// src-tauri/src/commands/streaming.rs

use tauri::{command, AppHandle, ipc::Channel};
use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum ProgressEvent {
    Started { total: usize },
    Progress { current: usize, message: String },
    Completed,
    Error { message: String },
}

/// Apply multiple settings with progress updates via Channel
/// Channels are optimized for fast, ordered streaming data
#[command]
pub async fn apply_profile(
    app: AppHandle,
    monitor_id: String,
    settings: Vec<(String, String)>,
    on_progress: Channel<ProgressEvent>,
) -> Result<(), String> {
    let total = settings.len();

    on_progress.send(ProgressEvent::Started { total }).unwrap();

    for (i, (setting, value)) in settings.iter().enumerate() {
        // Apply each setting
        let flag = format!("--{}", setting);
        let result = app
            .shell()
            .command("/home/ahmet/msigd/msigd")
            .args(["--monitor", &monitor_id, &flag, value])
            .output()
            .await;

        match result {
            Ok(output) if output.status.success() => {
                on_progress
                    .send(ProgressEvent::Progress {
                        current: i + 1,
                        message: format!("Applied {}", setting),
                    })
                    .unwrap();
            }
            Ok(output) => {
                on_progress
                    .send(ProgressEvent::Error {
                        message: String::from_utf8_lossy(&output.stderr).to_string(),
                    })
                    .unwrap();
                return Err(format!("Failed to apply {}", setting));
            }
            Err(e) => {
                on_progress
                    .send(ProgressEvent::Error {
                        message: e.to_string(),
                    })
                    .unwrap();
                return Err(e.to_string());
            }
        }
    }

    on_progress.send(ProgressEvent::Completed).unwrap();
    Ok(())
}
```

### 5.8 Main Entry Point (Tauri 2.0)

```rust
// src-tauri/src/lib.rs

mod commands;
mod error;
mod msigd;
mod state;

use commands::{display, monitor, color, led, advanced, streaming};
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register shell plugin for subprocess execution
        .plugin(tauri_plugin_shell::init())
        // Register application state
        .manage(AppState::new())
        // Register all command handlers
        .invoke_handler(tauri::generate_handler![
            // Monitor commands
            monitor::list_monitors,
            monitor::get_monitor_settings,
            monitor::select_monitor,
            // Display commands
            display::set_brightness,
            display::set_contrast,
            display::set_sharpness,
            display::set_response_time,
            display::set_eye_saver,
            display::set_image_enhancement,
            // Color commands
            color::set_color_preset,
            color::set_color_rgb,
            // LED commands
            led::set_mystic_light,
            // Advanced commands
            advanced::set_hdcr,
            advanced::set_refresh_rate_display,
            // Streaming commands
            streaming::apply_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```rust
// src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    msigd_gui_lib::run();
}
```

---

## 6. Frontend Implementation (Svelte 5)

### 6.1 TypeScript Types

```typescript
// src/lib/types.ts

export interface Monitor {
  id: string;
  serial: string;
  model: string;
  firmware: string;
}

export interface MonitorSettings {
  brightness: number;
  contrast: number;
  sharpness: number;
  responseTime: 'normal' | 'fast' | 'fastest';
  eyeSaver: boolean;
  imageEnhancement: 'off' | 'weak' | 'medium' | 'strong' | 'strongest';
  colorPreset: 'cool' | 'normal' | 'warm' | 'custom';
  colorRgb: { r: number; g: number; b: number };
  hdcr: boolean;
  refreshRateDisplay: boolean;
}

export interface MysticLightConfig {
  ledGroup: string;
  mode: MysticLightMode;
  colors: string[];
}

export type MysticLightMode =
  | 'off'
  | 'static'
  | 'breathing'
  | 'blinking'
  | 'flashing'
  | 'doubleFlashing'
  | 'lightning'
  | 'rainbow'
  | 'meteor'
  | 'rainbowGradient';

// Progress event types for channels
export type ProgressEvent =
  | { event: 'started'; data: { total: number } }
  | { event: 'progress'; data: { current: number; message: string } }
  | { event: 'completed' }
  | { event: 'error'; data: { message: string } };
```

### 6.2 API Bindings (Tauri 2.0)

```typescript
// src/lib/api/monitor.ts

import { invoke } from '@tauri-apps/api/core';
import type { Monitor, MonitorSettings } from '../types';

export async function listMonitors(): Promise<Monitor[]> {
  return invoke('list_monitors');
}

export async function getMonitorSettings(monitorId: string): Promise<MonitorSettings> {
  return invoke('get_monitor_settings', { monitorId });
}

export async function selectMonitor(monitorId: string): Promise<void> {
  return invoke('select_monitor', { monitorId });
}
```

```typescript
// src/lib/api/display.ts

import { invoke } from '@tauri-apps/api/core';

export async function setBrightness(monitorId: string, value: number): Promise<void> {
  return invoke('set_brightness', { monitorId, value });
}

export async function setContrast(monitorId: string, value: number): Promise<void> {
  return invoke('set_contrast', { monitorId, value });
}

export async function setSharpness(monitorId: string, value: number): Promise<void> {
  return invoke('set_sharpness', { monitorId, value });
}

export async function setResponseTime(monitorId: string, value: string): Promise<void> {
  return invoke('set_response_time', { monitorId, value });
}

export async function setEyeSaver(monitorId: string, enabled: boolean): Promise<void> {
  return invoke('set_eye_saver', { monitorId, enabled });
}
```

```typescript
// src/lib/api/streaming.ts

import { invoke, Channel } from '@tauri-apps/api/core';
import type { ProgressEvent } from '../types';

/**
 * Apply multiple settings with progress updates using Tauri Channels
 * Channels are optimized for fast, ordered streaming data
 */
export async function applyProfile(
  monitorId: string,
  settings: [string, string][],
  onProgress: (event: ProgressEvent) => void
): Promise<void> {
  const channel = new Channel<ProgressEvent>();
  channel.onmessage = onProgress;

  return invoke('apply_profile', {
    monitorId,
    settings,
    onProgress: channel,
  });
}
```

### 6.3 Event Listeners (Tauri 2.0)

```typescript
// src/lib/api/events.ts

import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface MonitorEvent {
  eventType: string;
  monitorId?: string;
  message: string;
}

export interface SettingChangedEvent {
  setting: string;
  value: string;
}

/**
 * Listen for monitor events from the backend
 */
export async function onMonitorEvent(
  callback: (event: MonitorEvent) => void
): Promise<UnlistenFn> {
  return listen<MonitorEvent>('monitor-event', (event) => {
    callback(event.payload);
  });
}

/**
 * Listen for setting change confirmations
 */
export async function onSettingChanged(
  callback: (event: SettingChangedEvent) => void
): Promise<UnlistenFn> {
  return listen<SettingChangedEvent>('setting-changed', (event) => {
    callback(event.payload);
  });
}
```

### 6.4 Svelte 5 State Management (Runes)

```typescript
// src/lib/state/monitors.svelte.ts

import type { Monitor, MonitorSettings } from '../types';
import { listMonitors, getMonitorSettings } from '../api/monitor';

/**
 * Svelte 5 reactive state using $state rune
 * This creates fine-grained reactivity without stores
 */
class MonitorState {
  monitors = $state<Monitor[]>([]);
  selectedId = $state<string | null>(null);
  settings = $state<MonitorSettings | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived state using $derived rune
  selectedMonitor = $derived(
    this.monitors.find((m) => m.id === this.selectedId)
  );

  async loadMonitors() {
    this.loading = true;
    this.error = null;

    try {
      this.monitors = await listMonitors();

      // Auto-select first monitor
      if (this.monitors.length > 0 && !this.selectedId) {
        await this.selectMonitor(this.monitors[0].id);
      }
    } catch (e) {
      this.error = String(e);
    } finally {
      this.loading = false;
    }
  }

  async selectMonitor(id: string) {
    this.selectedId = id;
    await this.loadSettings(id);
  }

  async loadSettings(monitorId: string) {
    this.loading = true;

    try {
      this.settings = await getMonitorSettings(monitorId);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.loading = false;
    }
  }

  updateSetting<K extends keyof MonitorSettings>(key: K, value: MonitorSettings[K]) {
    if (this.settings) {
      this.settings = { ...this.settings, [key]: value };
    }
  }
}

// Export singleton instance
export const monitorState = new MonitorState();
```

```typescript
// src/lib/state/ui.svelte.ts

/**
 * UI state using Svelte 5 $state rune
 */
class UIState {
  activeTab = $state<'display' | 'color' | 'led' | 'advanced'>('display');
  sidebarOpen = $state(true);
  toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}

export const uiState = new UIState();
```

### 6.5 UI Components (Svelte 5 Syntax)

```svelte
<!-- src/lib/components/Slider.svelte -->
<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    onchange?: (value: number) => void;
  }

  let {
    label,
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    disabled = false,
    onchange,
  }: Props = $props();

  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseInt(target.value, 10);

    // Debounce to avoid flooding msigd with commands
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onchange?.(value);
    }, 150);
  }
</script>

<div class="slider-container">
  <div class="slider-header">
    <label for={label}>{label}</label>
    <span class="value">{value}{unit}</span>
  </div>
  <input
    type="range"
    id={label}
    {min}
    {max}
    {step}
    {value}
    {disabled}
    oninput={handleInput}
    class="slider"
  />
</div>

<style>
  .slider-container {
    margin-bottom: 1rem;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #374151;
    appearance: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

```svelte
<!-- src/lib/components/Toggle.svelte -->
<script lang="ts">
  interface Props {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let {
    label,
    checked = $bindable(),
    disabled = false,
    onchange,
  }: Props = $props();

  function handleChange() {
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  class="toggle"
  class:checked
  {disabled}
  onclick={handleChange}
  role="switch"
  aria-checked={checked}
>
  <span class="toggle-label">{label}</span>
  <span class="toggle-track">
    <span class="toggle-thumb"></span>
  </span>
</button>

<style>
  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem 0;
    background: none;
    border: none;
    color: #f3f4f6;
    cursor: pointer;
  }

  .toggle-track {
    width: 44px;
    height: 24px;
    background: #374151;
    border-radius: 12px;
    position: relative;
    transition: background 0.2s;
  }

  .toggle.checked .toggle-track {
    background: #3b82f6;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle.checked .toggle-thumb {
    transform: translateX(20px);
  }

  .toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

```svelte
<!-- src/lib/components/ColorPicker.svelte -->
<script lang="ts">
  interface Props {
    r: number;
    g: number;
    b: number;
    onchange?: (color: { r: number; g: number; b: number }) => void;
  }

  let { r = $bindable(), g = $bindable(), b = $bindable(), onchange }: Props = $props();

  // Derived hex color using $derived
  let hexColor = $derived(rgbToHex(r, g, b));

  function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const scaled = Math.round((n / 100) * 255);
      return scaled.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function handleColorChange(channel: 'r' | 'g' | 'b', value: number) {
    if (channel === 'r') r = value;
    else if (channel === 'g') g = value;
    else b = value;

    onchange?.({ r, g, b });
  }
</script>

<div class="color-picker">
  <div class="preview" style="background-color: {hexColor}">
    <span class="hex-value">{hexColor}</span>
  </div>

  <div class="channels">
    <div class="channel red">
      <label>R</label>
      <input
        type="range"
        min="0"
        max="100"
        value={r}
        oninput={(e) => handleColorChange('r', parseInt(e.currentTarget.value))}
      />
      <span>{r}</span>
    </div>

    <div class="channel green">
      <label>G</label>
      <input
        type="range"
        min="0"
        max="100"
        value={g}
        oninput={(e) => handleColorChange('g', parseInt(e.currentTarget.value))}
      />
      <span>{g}</span>
    </div>

    <div class="channel blue">
      <label>B</label>
      <input
        type="range"
        min="0"
        max="100"
        value={b}
        oninput={(e) => handleColorChange('b', parseInt(e.currentTarget.value))}
      />
      <span>{b}</span>
    </div>
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    gap: 1rem;
    align-items: stretch;
  }

  .preview {
    width: 80px;
    min-height: 80px;
    border-radius: 8px;
    border: 2px solid #4b5563;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 4px;
  }

  .hex-value {
    font-size: 0.75rem;
    font-family: monospace;
    background: rgba(0, 0, 0, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .channels {
    flex: 1;
  }

  .channel {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .channel label {
    width: 1.25rem;
    font-weight: 600;
    font-family: monospace;
  }

  .channel.red label { color: #ef4444; }
  .channel.green label { color: #22c55e; }
  .channel.blue label { color: #3b82f6; }

  .channel input {
    flex: 1;
    height: 6px;
  }

  .channel span {
    width: 2.5rem;
    text-align: right;
    font-size: 0.875rem;
    font-family: monospace;
  }
</style>
```

### 6.6 Main Views (Svelte 5)

```svelte
<!-- src/lib/views/DisplayView.svelte -->
<script lang="ts">
  import Slider from '../components/Slider.svelte';
  import Toggle from '../components/Toggle.svelte';
  import Select from '../components/Select.svelte';
  import { monitorState } from '../state/monitors.svelte';
  import { uiState } from '../state/ui.svelte';
  import {
    setBrightness,
    setContrast,
    setSharpness,
    setResponseTime,
    setEyeSaver,
  } from '../api/display';

  // Access reactive state directly (Svelte 5 pattern)
  let settings = $derived(monitorState.settings);
  let monitorId = $derived(monitorState.selectedId);
  let loading = $derived(monitorState.loading);

  async function handleBrightness(value: number) {
    if (!monitorId) return;
    try {
      await setBrightness(monitorId, value);
      monitorState.updateSetting('brightness', value);
    } catch (e) {
      uiState.showToast(String(e), 'error');
    }
  }

  async function handleContrast(value: number) {
    if (!monitorId) return;
    try {
      await setContrast(monitorId, value);
      monitorState.updateSetting('contrast', value);
    } catch (e) {
      uiState.showToast(String(e), 'error');
    }
  }

  async function handleSharpness(value: number) {
    if (!monitorId) return;
    try {
      await setSharpness(monitorId, value);
      monitorState.updateSetting('sharpness', value);
    } catch (e) {
      uiState.showToast(String(e), 'error');
    }
  }

  async function handleResponseTime(value: string) {
    if (!monitorId) return;
    try {
      await setResponseTime(monitorId, value);
      monitorState.updateSetting('responseTime', value as any);
    } catch (e) {
      uiState.showToast(String(e), 'error');
    }
  }

  async function handleEyeSaver(enabled: boolean) {
    if (!monitorId) return;
    try {
      await setEyeSaver(monitorId, enabled);
      monitorState.updateSetting('eyeSaver', enabled);
    } catch (e) {
      uiState.showToast(String(e), 'error');
    }
  }
</script>

<div class="display-view">
  <h2>Display Settings</h2>

  {#if loading}
    <div class="loading">Loading settings...</div>
  {:else if settings}
    <div class="settings-group">
      <h3>Picture</h3>
      <Slider
        label="Brightness"
        bind:value={settings.brightness}
        min={0}
        max={100}
        unit="%"
        onchange={handleBrightness}
      />

      <Slider
        label="Contrast"
        bind:value={settings.contrast}
        min={0}
        max={100}
        unit="%"
        onchange={handleContrast}
      />

      <Slider
        label="Sharpness"
        bind:value={settings.sharpness}
        min={0}
        max={5}
        onchange={handleSharpness}
      />
    </div>

    <div class="settings-group">
      <h3>Performance</h3>
      <Select
        label="Response Time"
        value={settings.responseTime}
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast' },
          { value: 'fastest', label: 'Fastest' },
        ]}
        onchange={handleResponseTime}
      />
    </div>

    <div class="settings-group">
      <h3>Comfort</h3>
      <Toggle
        label="Eye Saver Mode"
        bind:checked={settings.eyeSaver}
        onchange={handleEyeSaver}
      />
    </div>
  {:else}
    <p class="no-monitor">No monitor selected</p>
  {/if}
</div>

<style>
  .display-view {
    padding: 1.5rem;
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #9ca3af;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .settings-group {
    background: #1f2937;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .no-monitor,
  .loading {
    color: #9ca3af;
    text-align: center;
    padding: 3rem;
  }
</style>
```

### 6.7 Main App Component (Svelte 5)

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { monitorState } from './lib/state/monitors.svelte';
  import { uiState } from './lib/state/ui.svelte';
  import { onMonitorEvent } from './lib/api/events';
  import DisplayView from './lib/views/DisplayView.svelte';
  import ColorView from './lib/views/ColorView.svelte';
  import LedView from './lib/views/LedView.svelte';
  import AdvancedView from './lib/views/AdvancedView.svelte';

  // Derived state
  let monitors = $derived(monitorState.monitors);
  let selectedId = $derived(monitorState.selectedId);
  let loading = $derived(monitorState.loading);
  let error = $derived(monitorState.error);
  let activeTab = $derived(uiState.activeTab);
  let toast = $derived(uiState.toast);

  const tabs = [
    { id: 'display' as const, label: 'Display', icon: 'monitor' },
    { id: 'color' as const, label: 'Color', icon: 'palette' },
    { id: 'led' as const, label: 'LED', icon: 'lightbulb' },
    { id: 'advanced' as const, label: 'Advanced', icon: 'settings' },
  ];

  onMount(() => {
    // Load monitors on mount
    monitorState.loadMonitors();

    // Listen for backend events
    const unsubscribe = onMonitorEvent((event) => {
      console.log('Monitor event:', event);
      if (event.eventType === 'disconnected') {
        uiState.showToast('Monitor disconnected', 'error');
        monitorState.loadMonitors();
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe.then((fn) => fn());
    };
  });
</script>

<main class="app">
  <!-- Header with monitor selector -->
  <header class="header">
    <h1>MSI Monitor Control</h1>

    <select
      class="monitor-select"
      value={selectedId}
      onchange={(e) => monitorState.selectMonitor(e.currentTarget.value)}
      disabled={loading}
    >
      {#each monitors as monitor (monitor.id)}
        <option value={monitor.id}>
          {monitor.model} ({monitor.serial})
        </option>
      {/each}
    </select>
  </header>

  <!-- Tab navigation -->
  <nav class="tabs">
    {#each tabs as tab (tab.id)}
      <button
        class="tab"
        class:active={activeTab === tab.id}
        onclick={() => (uiState.activeTab = tab.id)}
      >
        <span class="label">{tab.label}</span>
      </button>
    {/each}
  </nav>

  <!-- Content area -->
  <div class="content">
    {#if loading && monitors.length === 0}
      <div class="loading">Detecting monitors...</div>
    {:else if error}
      <div class="error">
        <p>{error}</p>
        <button onclick={() => monitorState.loadMonitors()}>Retry</button>
      </div>
    {:else if monitors.length === 0}
      <div class="no-monitors">
        <p>No MSI monitors detected</p>
        <p class="hint">Make sure your monitor is connected via USB</p>
      </div>
    {:else if activeTab === 'display'}
      <DisplayView />
    {:else if activeTab === 'color'}
      <ColorView />
    {:else if activeTab === 'led'}
      <LedView />
    {:else if activeTab === 'advanced'}
      <AdvancedView />
    {/if}
  </div>

  <!-- Toast notifications -->
  {#if toast}
    <div class="toast" class:error={toast.type === 'error'}>
      {toast.message}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #111827;
    color: #f3f4f6;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #1f2937;
    border-bottom: 1px solid #374151;
  }

  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .monitor-select {
    padding: 0.5rem 1rem;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 6px;
    color: #f3f4f6;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .monitor-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tabs {
    display: flex;
    background: #1f2937;
    border-bottom: 1px solid #374151;
    padding: 0 1rem;
  }

  .tab {
    padding: 0.875rem 1.25rem;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .tab:hover {
    color: #f3f4f6;
  }

  .tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .content {
    flex: 1;
    overflow-y: auto;
  }

  .loading,
  .error,
  .no-monitors {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: #9ca3af;
    gap: 1rem;
  }

  .error {
    color: #ef4444;
  }

  .error button {
    padding: 0.5rem 1rem;
    background: #374151;
    border: none;
    border-radius: 6px;
    color: #f3f4f6;
    cursor: pointer;
  }

  .hint {
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.5rem;
    background: #22c55e;
    color: white;
    border-radius: 8px;
    font-size: 0.875rem;
    animation: slide-up 0.3s ease;
  }

  .toast.error {
    background: #ef4444;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
```

---

## 7. Implementation Phases

### Phase 1: Project Setup

**Tasks:**
- [ ] Initialize Tauri 2.0 project with Svelte 5 template
- [ ] Configure Tailwind CSS 4
- [ ] Set up project structure (folders, modules)
- [ ] Configure TypeScript with strict mode
- [ ] Add tauri-plugin-shell to Cargo.toml
- [ ] Create basic error types in Rust
- [ ] Test msigd CLI integration via shell plugin

**Deliverable:** Skeleton project that can invoke `msigd --list`

**Commands:**
```bash
# Create Tauri 2.0 + Svelte 5 project
npm create tauri-app@latest msigd-gui -- --template svelte-ts

cd msigd-gui

# Add shell plugin
npm install @tauri-apps/plugin-shell

# In src-tauri/Cargo.toml, add:
# tauri-plugin-shell = "2"

# Add Tailwind 4
npm install -D tailwindcss @tailwindcss/vite

# Test development
npm run tauri dev
```

---

### Phase 2: Core Backend

**Tasks:**
- [ ] Implement msigd executor using shell plugin
- [ ] Implement output parser for `--list`
- [ ] Implement output parser for `--query --numeric`
- [ ] Create Tauri commands for monitor listing
- [ ] Create Tauri commands for getting settings
- [ ] Add AppState with Mutex for caching
- [ ] Add proper error handling with serializable errors

**Deliverable:** Backend can list monitors and query settings

---

### Phase 3: Basic UI (Svelte 5)

**Tasks:**
- [ ] Create Slider component with $props and $bindable
- [ ] Create Toggle component
- [ ] Create Select component
- [ ] Implement state using $state runes (.svelte.ts files)
- [ ] Build DisplayView with brightness/contrast/sharpness
- [ ] Implement monitor selection dropdown
- [ ] Add tab navigation

**Deliverable:** Working UI with display settings controls

---

### Phase 4: Full Display & Color Controls

**Tasks:**
- [ ] Add response time selector
- [ ] Add eye saver toggle
- [ ] Add image enhancement selector
- [ ] Create ColorPicker component with $derived
- [ ] Build ColorView with preset selector
- [ ] Implement custom RGB controls
- [ ] Add HDCR toggle

**Deliverable:** Complete display and color controls

---

### Phase 5: Mystic Light LED Controls

**Tasks:**
- [ ] Parse Mystic Light configuration format
- [ ] Create LED mode selector component
- [ ] Create multi-color picker for LED modes
- [ ] Build LedView with all LED options
- [ ] Test different LED modes (breathing, rainbow, etc.)
- [ ] Add LED group selection

**Deliverable:** Full Mystic Light control

---

### Phase 6: Advanced Features & Polish

**Tasks:**
- [ ] Build AdvancedView with remaining settings
- [ ] Add OSD transparency/timeout controls
- [ ] Implement screen assistance features
- [ ] Add event listeners for monitor events
- [ ] Implement Channels for profile application progress
- [ ] Add toast notifications
- [ ] Improve error handling and user feedback
- [ ] Add loading states and animations
- [ ] Implement debouncing for rapid changes
- [ ] Polish UI styling

**Deliverable:** Complete feature set

---

### Phase 7: Testing & Packaging

**Tasks:**
- [ ] Write unit tests for Rust parser
- [ ] Write integration tests for commands
- [ ] Add Tauri IPC mocking for frontend tests
- [ ] Test on multiple monitors
- [ ] Configure capabilities for production
- [ ] Create Linux AppImage
- [ ] Create Windows installer
- [ ] Test installers on fresh systems
- [ ] Write user documentation

**Deliverable:** Release-ready application

---

## 8. Build & Deployment

### 8.1 Development

```bash
# Start development server with hot-reload
npm run tauri dev
```

### 8.2 Building for Release

```bash
# Build optimized release
npm run tauri build
```

**Output locations:**
- Linux: `src-tauri/target/release/bundle/appimage/`
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`

### 8.3 Tauri Configuration (Tauri 2.0)

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "MSI Monitor Control",
  "version": "0.1.0",
  "identifier": "com.msigd.gui",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "MSI Monitor Control",
        "width": 480,
        "height": 680,
        "resizable": true,
        "minWidth": 400,
        "minHeight": 500
      }
    ],
    "security": {
      "csp": {
        "default-src": "'self'",
        "style-src": "'self' 'unsafe-inline'",
        "connect-src": "ipc: http://ipc.localhost"
      }
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "linux": {
      "appimage": {
        "bundleMediaFramework": false
      }
    }
  }
}
```

### 8.4 Capabilities (Tauri 2.0 Security)

```json
// src-tauri/capabilities/default.json
{
  "$schema": "https://schemas.tauri.app/capability/v1",
  "identifier": "default",
  "description": "Default capabilities for msigd-gui",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-spawn",
    "shell:allow-execute",
    {
      "identifier": "shell:allow-spawn",
      "allow": [
        {
          "name": "msigd",
          "cmd": "/home/ahmet/msigd/msigd",
          "args": true
        }
      ]
    }
  ]
}
```

### 8.5 udev Rules (Linux)

```bash
# /etc/udev/rules.d/51-msi-gaming-device.rules
SUBSYSTEM=="usb", ATTR{idVendor}=="1462", MODE="0666"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="1462", MODE="0666"
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Rust)

```rust
// src-tauri/src/msigd/parser_test.rs

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_monitor_list() {
        let output = "Monitor 0: Serial=ABC123 Model=MAG274QRF-QD Firmware=V18\n\
                      Monitor 1: Serial=DEF456 Model=MPG341CQR Firmware=V12";

        let monitors = MsigdParser::parse_monitor_list(output).unwrap();

        assert_eq!(monitors.len(), 2);
        assert_eq!(monitors[0].model, "MAG274QRF-QD");
        assert_eq!(monitors[1].serial, "DEF456");
    }

    #[test]
    fn test_parse_settings() {
        let output = "brightness: 75\ncontrast: 50\nsharpness: 3\n\
                      response_time: fast\neye_saver: off";

        let settings = MsigdParser::parse_settings(output).unwrap();

        assert_eq!(settings.brightness, 75);
        assert_eq!(settings.response_time, ResponseTime::Fast);
    }
}
```

### 9.2 Frontend Tests with Tauri Mocking

```typescript
// src/lib/__tests__/api.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { listMonitors } from '../api/monitor';

describe('Monitor API', () => {
  beforeEach(() => {
    mockIPC((cmd, args) => {
      if (cmd === 'list_monitors') {
        return [
          { id: '0', serial: 'ABC123', model: 'MAG274QRF-QD', firmware: 'V18' },
        ];
      }
    });
  });

  afterEach(() => {
    clearMocks();
  });

  it('should list monitors', async () => {
    const monitors = await listMonitors();

    expect(monitors).toHaveLength(1);
    expect(monitors[0].model).toBe('MAG274QRF-QD');
  });
});
```

### 9.3 Event Mocking (Tauri 2.7+)

```typescript
// src/lib/__tests__/events.test.ts

import { describe, it, expect, vi } from 'vitest';
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks';
import { emit, listen } from '@tauri-apps/api/event';

describe('Event System', () => {
  it('should handle monitor events', async () => {
    mockIPC(() => {}, { shouldMockEvents: true });

    const handler = vi.fn();
    await listen('monitor-event', handler);

    await emit('monitor-event', {
      eventType: 'disconnected',
      monitorId: '0',
      message: 'Monitor disconnected',
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          eventType: 'disconnected',
        }),
      })
    );

    clearMocks();
  });
});
```

---

## 10. Security Considerations

### 10.1 Tauri 2.0 Capabilities System

Tauri 2.0 introduces a capabilities-based security model:

```json
// Only allow specific commands
{
  "permissions": [
    "shell:allow-spawn",
    {
      "identifier": "shell:allow-spawn",
      "allow": [
        {
          "name": "msigd",
          "cmd": "/home/ahmet/msigd/msigd",
          "args": true
        }
      ]
    }
  ]
}
```

### 10.2 Content Security Policy

```json
"security": {
  "csp": {
    "default-src": "'self'",
    "style-src": "'self' 'unsafe-inline'",
    "connect-src": "ipc: http://ipc.localhost",
    "img-src": "'self' data:"
  }
}
```

### 10.3 Input Validation

- Validate all user inputs before passing to msigd
- Use typed enums for option values
- Sanitize command arguments in Rust backend
- Never construct shell commands from user input directly

### 10.4 Privilege Escalation

Options for USB access:
1. **udev rules (Recommended):** Install rules to allow user access
2. **polkit/pkexec:** Prompt for password when needed
3. **Run msigd with sudo:** Not recommended for GUI apps

---

## Appendix A: Tauri 2.0 vs 1.x Key Changes

| Feature | Tauri 1.x | Tauri 2.0 |
|---------|-----------|-----------|
| IPC | String serialization | Custom protocols (faster) |
| Streaming | Events only | Channels API (optimized) |
| Security | allowlist | Capabilities system |
| Commands | `#[tauri::command]` | Same, but async must return `Result` |
| State | `State<T>` | Same, use `Mutex` for async |
| Shell | Built-in | `tauri-plugin-shell` |
| Config | `tauri.conf.json` | Same schema, v2 features |

---

## Appendix B: Svelte 5 vs 4 Key Changes

| Feature | Svelte 4 | Svelte 5 |
|---------|----------|----------|
| Reactivity | `let x = 0` | `let x = $state(0)` |
| Derived | `$: doubled = x * 2` | `let doubled = $derived(x * 2)` |
| Effects | `$: { console.log(x) }` | `$effect(() => { console.log(x) })` |
| Props | `export let prop` | `let { prop } = $props()` |
| Bindable | `export let value` | `let { value = $bindable() } = $props()` |
| Events | `dispatch('event')` | `onchange?.(value)` (callbacks) |
| Stores | `writable()` | `$state` in `.svelte.ts` files |

---

## Appendix C: msigd Command Reference

| Setting | Flag | Values |
|---------|------|--------|
| Brightness | `--brightness` | 0-100 |
| Contrast | `--contrast` | 0-100 |
| Sharpness | `--sharpness` | 0-5 |
| Response Time | `--response_time` | normal, fast, fastest |
| Eye Saver | `--eye_saver` | on, off |
| Image Enhancement | `--image_enhancement` | off, weak, medium, strong, strongest |
| Color Preset | `--color_preset` | cool, normal, warm, custom |
| Color RGB | `--color_rgb` | r:g:b (each 0-100) |
| HDCR | `--hdcr` | on, off |
| Refresh Rate Display | `--refresh_rate_display` | on, off |
| Mystic Light | `--mystic` | ledgroup:mode:colors |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Claude | Initial plan |
| 2.0 | 2026-01-20 | Claude | Updated with Tauri 2.0 and Svelte 5 best practices from official docs |

---

## References

- [Tauri 2.0 Documentation](https://v2.tauri.app/)
- [Tauri Commands Guide](https://v2.tauri.app/develop/calling-rust)
- [Tauri State Management](https://v2.tauri.app/develop/state-management)
- [Tauri Events & Channels](https://v2.tauri.app/develop/calling-frontend)
- [Tauri Shell Plugin](https://v2.tauri.app/reference/javascript/shell)
- [Tauri Capabilities](https://v2.tauri.app/security/capabilities)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/$state)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
