# GUI Options for msigd

This document compares different approaches to creating a graphical user interface for [msigd](https://github.com/couriersud/msigd) - the MSI Gaming Device control application.

## msigd Overview

msigd is a CLI tool that controls MSI monitors via USB. Key features:
- Query and set monitor settings (brightness, contrast, sharpness, etc.)
- RGB LED control (Mystic Light)
- Response time, refresh rate display, eye saver mode
- Multi-monitor support
- Requires root or udev rules for USB access

### Key Settings Available
| Setting | Access | Description |
|---------|--------|-------------|
| brightness | RW | 0-100 |
| contrast | RW | 0-100 |
| sharpness | RW | 0-5 |
| response_time | RW | normal/fast/fastest |
| eye_saver | RW | on/off |
| image_enhancement | RW | off/weak/medium/strong/strongest |
| color_preset | RW | cool/normal/warm/custom |
| color_rgb | RW | RGB triplet (v1,v2,v3 <= 100) |
| mystic (LED) | W | ledgroup:mode:colors |
| refresh_display | RW | on/off |
| hdcr | RW | on/off |

---

## GUI Framework Comparison

### Option 1: Python + PyQt/PySide (Recommended)

**Pros:**
- Rapid development
- Rich widget library (sliders, color pickers, tabs)
- Qt Designer for visual layout
- Cross-platform (Linux, Windows, macOS)
- PySide6 has LGPL license (commercial-friendly)
- Easy subprocess calls to msigd CLI

**Cons:**
- Larger binary size (~50-100MB bundled)
- Python dependency

**Effort:** Low-Medium (1-2 weeks for full app)

**Example Architecture:**
```
msigd-gui/
├── main.py
├── ui/
│   ├── main_window.ui    # Qt Designer file
│   └── settings_tab.ui
├── controllers/
│   ├── msigd_wrapper.py  # Calls msigd CLI
│   └── monitor_controller.py
└── requirements.txt
```

---

### Option 2: Python + Tkinter

**Pros:**
- Zero dependencies (built into Python)
- Smallest bundle size
- Simple to learn

**Cons:**
- Dated appearance
- Limited widgets (no native color picker, sliders less polished)
- No Qt Designer equivalent

**Effort:** Low (1 week for basic app)

---

### Option 3: C++ + Qt

**Pros:**
- Native performance
- Most feature-rich framework
- Integrates directly with msigd source code (no CLI wrapper needed)
- Professional appearance

**Cons:**
- Longer development time
- Complex build system (CMake + Qt)
- GPL license requires open-source or commercial license

**Effort:** Medium-High (3-4 weeks)

**Example Architecture:**
```
msigd-gui/
├── CMakeLists.txt
├── src/
│   ├── main.cpp
│   ├── mainwindow.cpp
│   ├── mainwindow.h
│   └── msigd_interface.cpp  # Direct libusb/hidapi integration
├── ui/
│   └── mainwindow.ui
└── resources/
    └── icons/
```

---

### Option 4: GTK (gtkmm or PyGObject)

**Pros:**
- Native Linux look
- Good GNOME integration
- LGPL license

**Cons:**
- Less polished on Windows/macOS
- Smaller community than Qt

**Effort:** Medium (2-3 weeks)

---

---

## Rust GUI Options (Detailed)

### Option 5a: egui (Immediate Mode)

egui is an immediate mode GUI - you describe the entire UI each frame without complex state management.

**Pros:**
- Pure Rust, no DSLs or macros
- Very fast compilation
- Single binary output (~5-15MB)
- Great for tools and utilities
- Active development, good documentation
- Works with multiple backends (OpenGL, wgpu, etc.)

**Cons:**
- Non-native appearance (custom rendering)
- Limited accessibility support
- Immediate mode paradigm unfamiliar to some

**Best For:** Debug tools, utilities, game dev tools

**Example:**
```rust
egui::CentralPanel::default().show(ctx, |ui| {
    ui.heading("MSI Monitor Control");
    ui.add(egui::Slider::new(&mut brightness, 0..=100).text("Brightness"));
    if ui.button("Apply").clicked() {
        set_brightness(brightness);
    }
});
```

**Effort:** Medium (2-3 weeks)

---

### Option 5b: iced (Elm-inspired)

iced follows The Elm Architecture - state, messages, and view functions.

**Pros:**
- Type-safe, predictable state management
- Clean architecture for complex apps
- Cross-platform (Linux, Windows, macOS, Web)
- Growing ecosystem

**Cons:**
- Steeper learning curve
- Accessibility still incomplete (open issue for 4+ years)
- Slower iteration than egui

**Best For:** Larger, structured applications

**Effort:** Medium-High (3-4 weeks)

---

### Option 5c: Slint (Declarative DSL)

Slint uses its own markup language separating UI design from logic.

**Pros:**
- Designer-friendly DSL
- Live preview tooling
- Embedded systems support
- Professional backing (ex-Qt developers)

**Cons:**
- Requires commercial license for closed-source
- Learning custom DSL
- Less community resources

**Effort:** Medium (2-3 weeks)

---

### Option 5d: Dioxus (React-like)

Dioxus brings React patterns to Rust with JSX-like syntax.

**Pros:**
- Familiar to React developers
- Supports desktop (WebView), web, mobile
- Hot reloading
- Growing rapidly

**Cons:**
- Desktop uses WebView (not native rendering)
- Younger ecosystem

**Best For:** Teams with React experience

---

### Option 5e: Freya (Dioxus + Skia)

Combines Dioxus logic with native Skia rendering (no WebView).

**Pros:**
- Native rendering performance
- Dioxus/React-like development
- Modern appearance

**Cons:**
- Bleeding edge, less stable
- Smaller community

---

## TypeScript/Web GUI Options (Detailed)

### Option 6a: Tauri (Recommended for TS)

Tauri uses system WebView with a Rust backend.

**Pros:**
- Tiny bundle size (~2-10MB vs Electron's 100MB+)
- Low memory usage (~30-50MB vs 200-400MB)
- Use any frontend framework (React, Vue, Svelte, SolidJS)
- Security-first design
- Tauri 2.0 (2024) added mobile support
- Can call Rust from TypeScript easily

**Cons:**
- System WebView differences across platforms
- Native features require some Rust
- Younger ecosystem than Electron

**Performance:**
| Metric | Tauri | Electron |
|--------|-------|----------|
| App Size | ~2.5MB | ~85MB |
| RAM (idle) | 30-50MB | 200-400MB |
| Startup | 0.4s | 1.5s |

**Example Architecture:**
```
msigd-gui/
├── src-tauri/
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   └── commands.rs    # Rust commands callable from TS
│   └── tauri.conf.json
├── src/                    # Frontend (React/Vue/Svelte)
│   ├── App.tsx
│   ├── components/
│   │   ├── BrightnessSlider.tsx
│   │   └── ColorPicker.tsx
│   └── lib/
│       └── msigd.ts       # Invoke Tauri commands
├── package.json
└── vite.config.ts
```

**Calling msigd from Tauri (Rust side):**
```rust
#[tauri::command]
fn set_brightness(value: u8) -> Result<(), String> {
    std::process::Command::new("/home/ahmet/msigd/msigd")
        .arg(format!("--brightness={}", value))
        .output()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

**TypeScript side:**
```typescript
import { invoke } from '@tauri-apps/api/core';

async function setBrightness(value: number) {
  await invoke('set_brightness', { value });
}
```

**Effort:** Medium (2-3 weeks)

---

### Option 6b: Electron

The established standard for web-based desktop apps.

**Pros:**
- Massive ecosystem and community
- Node.js integration (direct USB access possible)
- Consistent behavior across platforms
- Used by VS Code, Slack, Discord

**Cons:**
- Large bundle size (~100MB+)
- High memory usage (200-400MB)
- Ships entire Chromium

**When to Choose:** Need Node.js APIs, team already knows Electron

**Effort:** Low-Medium (1-2 weeks)

---

### Option 6c: Neutralino

Lightweight alternative using system browser.

**Pros:**
- Extremely small (~3MB)
- Simple to get started

**Cons:**
- Single developer project
- No auto-updater
- Limited native features
- Not production-ready

**Verdict:** Avoid for serious projects

---

### Option 7: Web-based (Local Server)

**Pros:**
- No native UI framework needed
- Accessible from any device on network
- Modern UI with any web framework

**Cons:**
- Requires running a server
- Security considerations (USB access)
- Less "native" feel

**Effort:** Low-Medium (1-2 weeks)

---

## Recommendation Summary

### By Language Preference

| If you prefer... | Use | Why |
|------------------|-----|-----|
| **TypeScript/Web** | **Tauri** | Modern UI, tiny bundle, good DX |
| **Rust (pure)** | **egui** | Simple, fast, single binary |
| **Rust (structured)** | **iced** | Clean architecture, type-safe |
| **Python** | **PySide6** | Rapid development, rich widgets |
| **C++** | **Qt** | Direct msigd integration |

### By Priority

| Rank | Framework | Bundle | RAM | Best For |
|------|-----------|--------|-----|----------|
| 1 | **Tauri + React/Svelte** | ~5MB | 30MB | Modern UI, web devs |
| 2 | **egui** | ~10MB | 20MB | Rust devs, utilities |
| 3 | **Python + PySide6** | ~80MB | 100MB | Rapid prototyping |
| 4 | **iced** | ~15MB | 30MB | Complex Rust apps |
| 5 | **Electron** | ~100MB | 300MB | Existing Electron expertise |

### Suggested Approach

**For Rust developers:**
1. Start with **egui** for quick prototype
2. Consider **iced** if app grows complex
3. Use `std::process::Command` to call msigd CLI

**For TypeScript/Web developers:**
1. Start with **Tauri + your preferred framework** (React, Vue, Svelte)
2. Write Rust commands for msigd CLI calls
3. Minimal Rust knowledge needed initially

**For Python developers:**
1. Start with **PySide6**
2. Use subprocess to call msigd CLI

---

## Implementation Notes

### Calling msigd from Python
```python
import subprocess
import json

def query_settings():
    result = subprocess.run(
        ['/home/ahmet/msigd/msigd', '--query', '--numeric'],
        capture_output=True, text=True
    )
    return parse_output(result.stdout)

def set_brightness(value):
    subprocess.run(['/home/ahmet/msigd/msigd', f'--brightness={value}'])
```

### Root/Permissions Handling
- Use pkexec/polkit for privilege escalation
- Or configure udev rules (preferred):
  ```
  /etc/udev/rules.d/51-msi-gaming-device.rules
  ```

---

## Next Steps

1. Choose framework based on requirements
2. Create basic window with monitor detection
3. Implement settings controls (sliders, dropdowns)
4. Add LED/Mystic Light color picker
5. Add multi-monitor support
6. Package for distribution
