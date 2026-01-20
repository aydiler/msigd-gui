# egui vs iced: Detailed Comparison

A comprehensive comparison of the two most mature Rust GUI frameworks for building a msigd GUI.

## Quick Summary

| Aspect | egui | iced |
|--------|------|------|
| **Paradigm** | Immediate mode | Retained mode (Elm architecture) |
| **GitHub Stars** | 27.8k | 29.1k |
| **Learning Curve** | Lower | Higher |
| **Code Style** | Imperative | Functional/Declarative |
| **Best For** | Tools, prototypes, game UIs | Structured apps, production software |
| **State Management** | You manage it | Framework manages it |

---

## Architecture Comparison

### egui: Immediate Mode

In immediate mode, you redraw the entire UI every frame. No widget tree, no retained state.

```rust
// egui - You describe UI every frame
fn update(&mut self, ctx: &egui::Context) {
    egui::CentralPanel::default().show(ctx, |ui| {
        ui.heading("MSI Monitor Control");

        // Slider directly modifies your state
        ui.add(egui::Slider::new(&mut self.brightness, 0..=100)
            .text("Brightness"));

        // Button returns true when clicked
        if ui.button("Apply").clicked() {
            self.apply_settings();
        }

        // Conditional UI is trivial
        if self.show_advanced {
            ui.add(egui::Slider::new(&mut self.contrast, 0..=100)
                .text("Contrast"));
        }
    });
}
```

**Pros:**
- Simple mental model - just functions
- Easy conditional rendering
- No message passing boilerplate
- Great for rapid iteration

**Cons:**
- Can get messy in large apps
- Redraws even when nothing changes
- State scattered across your code

---

### iced: Elm Architecture (Model-Update-View)

Iced separates state, messages, view, and update logic.

```rust
// iced - Separate state, messages, view, update

// 1. Define your state
struct MonitorControl {
    brightness: u8,
    contrast: u8,
    show_advanced: bool,
}

// 2. Define messages (events)
#[derive(Debug, Clone)]
enum Message {
    BrightnessChanged(u8),
    ContrastChanged(u8),
    ApplyPressed,
    ToggleAdvanced,
}

// 3. Update state based on messages
fn update(&mut self, message: Message) {
    match message {
        Message::BrightnessChanged(val) => self.brightness = val,
        Message::ContrastChanged(val) => self.contrast = val,
        Message::ApplyPressed => self.apply_settings(),
        Message::ToggleAdvanced => self.show_advanced = !self.show_advanced,
    }
}

// 4. View renders state to widgets
fn view(&self) -> Element<Message> {
    let mut content = column![
        text("MSI Monitor Control").size(24),
        slider(0..=100, self.brightness, Message::BrightnessChanged),
        button("Apply").on_press(Message::ApplyPressed),
    ];

    if self.show_advanced {
        content = content.push(
            slider(0..=100, self.contrast, Message::ContrastChanged)
        );
    }

    container(content).into()
}
```

**Pros:**
- Clear separation of concerns
- Predictable state flow
- Easier to test and debug
- Time-travel debugging (iced 0.14+)
- Better for large apps

**Cons:**
- More boilerplate
- Message enum grows with features
- Learning curve for Elm pattern

---

## Feature Comparison

### Widgets

| Widget | egui | iced |
|--------|------|------|
| Button | ✅ | ✅ |
| Slider | ✅ | ✅ |
| Text Input | ✅ | ✅ |
| Checkbox | ✅ | ✅ |
| Radio Button | ✅ | ✅ |
| Dropdown/ComboBox | ✅ | ✅ (pick_list) |
| Color Picker | ✅ (egui_extras) | ❌ (community crate) |
| Progress Bar | ✅ | ✅ |
| Scrollable | ✅ | ✅ |
| Tabs | ✅ | ❌ (custom) |
| Tables | ✅ (egui_extras) | ❌ (custom) |
| Tooltips | ✅ | ✅ |
| Modal/Dialog | ✅ | ✅ |
| Canvas/Custom Drawing | ✅ | ✅ (canvas widget) |

**For msigd-gui:** Both have sliders and dropdowns needed for monitor settings. egui has a built-in color picker (useful for LED control).

---

### Platform Support

| Platform | egui | iced |
|----------|------|------|
| Linux | ✅ | ✅ |
| Windows | ✅ | ✅ |
| macOS | ✅ | ✅ |
| Web (WASM) | ✅ | ✅ |
| Android | ⚠️ Experimental | ❌ |
| iOS | ⚠️ Experimental | ❌ |

---

### Rendering Backends

**egui:**
- OpenGL (egui-glow)
- wgpu (egui-wgpu)
- Software rendering available

**iced:**
- wgpu (Vulkan, Metal, DX12)
- tiny-skia (software fallback)
- DOM (web)

---

## Performance

From [Lukas Kalbertodt's benchmark](http://lukaskalbertodt.github.io/2023/02/03/tauri-iced-egui-performance-comparison.html):

| Metric | egui | iced |
|--------|------|------|
| Startup Time | Fast (~100ms) | Medium (~200ms) |
| Idle CPU | Low | Very Low |
| Input Latency | Low | Low |
| Binary Size | ~5-10MB | ~10-15MB |
| RAM Usage | ~20-30MB | ~30-50MB |

**Note:** egui redraws every frame but is highly optimized. iced only redraws when state changes.

---

## Development Experience

### egui

```rust
// Adding a new control is one line
ui.add(egui::Slider::new(&mut self.sharpness, 0..=5).text("Sharpness"));

// Conditional UI is natural
if self.monitor_type == MonitorType::Gaming {
    ui.checkbox(&mut self.hdcr, "HDCR");
}
```

- Faster to prototype
- Less ceremony
- Hot reloading with eframe
- Great documentation

### iced

```rust
// Need to add message variant
enum Message {
    // ...existing...
    SharpnessChanged(u8),
}

// Update match arm
Message::SharpnessChanged(val) => self.sharpness = val,

// Add to view
slider(0..=5, self.sharpness, Message::SharpnessChanged)
```

- More structured
- Time-travel debugging (0.14+)
- Official book: [book.iced.rs](https://book.iced.rs/)
- Headless testing (0.14+)

---

## Real-World Usage

### egui Projects
- [Rerun](https://rerun.io/) - Visualization for computer vision
- Game engine integrations (Bevy, macroquad)
- Debug/profiler overlays
- Internal tools

### iced Projects
- [COSMIC Desktop](https://system76.com/cosmic) - System76's desktop environment
- [Halloy](https://github.com/squidowl/halloy) - IRC client
- [Airshipper](https://gitlab.com/veloren/airshipper) - Veloren launcher
- [Liana](https://wizardsardine.com/liana/) - Bitcoin wallet

---

## For msigd-gui Specifically

### Why egui might be better:
1. **Color picker built-in** - Needed for Mystic Light LED control
2. **Faster iteration** - Add sliders/controls quickly
3. **Simpler for small app** - msigd-gui isn't complex
4. **Tabs support** - Organize by feature (Display, LED, Advanced)

### Why iced might be better:
1. **Cleaner architecture** - If app grows
2. **Used by COSMIC** - Production-proven on Linux
3. **Better theming** - More polished default look
4. **Async support** - If doing USB polling

---

## Recommendation for msigd-gui

**Start with egui** because:
- msigd-gui is a utility, not a complex app
- Built-in color picker for LED control
- Faster to get working prototype
- Simpler code for ~10-15 settings

**Consider iced if:**
- You want practice with Elm architecture
- Planning to expand significantly
- Need time-travel debugging

---

## Example: msigd-gui in egui

```rust
use eframe::egui;

struct MsigdGui {
    brightness: u8,
    contrast: u8,
    sharpness: u8,
    response_time: ResponseTime,
    eye_saver: bool,
    led_color: egui::Color32,
}

impl eframe::App for MsigdGui {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("MSI Monitor Control");

            ui.group(|ui| {
                ui.label("Display Settings");
                ui.add(egui::Slider::new(&mut self.brightness, 0..=100)
                    .text("Brightness"));
                ui.add(egui::Slider::new(&mut self.contrast, 0..=100)
                    .text("Contrast"));
                ui.add(egui::Slider::new(&mut self.sharpness, 0..=5)
                    .text("Sharpness"));
            });

            ui.group(|ui| {
                ui.label("Features");
                ui.checkbox(&mut self.eye_saver, "Eye Saver Mode");
                egui::ComboBox::from_label("Response Time")
                    .selected_text(format!("{:?}", self.response_time))
                    .show_ui(ui, |ui| {
                        ui.selectable_value(&mut self.response_time,
                            ResponseTime::Normal, "Normal");
                        ui.selectable_value(&mut self.response_time,
                            ResponseTime::Fast, "Fast");
                        ui.selectable_value(&mut self.response_time,
                            ResponseTime::Fastest, "Fastest");
                    });
            });

            ui.group(|ui| {
                ui.label("Mystic Light");
                ui.color_edit_button_srgba(&mut self.led_color);
            });

            if ui.button("Apply").clicked() {
                self.apply_to_monitor();
            }
        });
    }
}
```

---

## Resources

### egui
- GitHub: [github.com/emilk/egui](https://github.com/emilk/egui)
- Docs: [docs.rs/egui](https://docs.rs/egui)
- Demo: [egui.rs](https://www.egui.rs/)
- License: MIT/Apache-2.0

### iced
- GitHub: [github.com/iced-rs/iced](https://github.com/iced-rs/iced)
- Book: [book.iced.rs](https://book.iced.rs/)
- Docs: [docs.rs/iced](https://docs.rs/iced)
- License: MIT
