# E2E Interactive Testing Plan

## Overview

This document outlines the comprehensive E2E testing strategy for the MSI Monitor Control GUI application. Tests interact with all UI controls (sliders, toggles, selects, buttons) and verify that each interaction produces the expected result.

## Testing Stack

- **Framework**: WebdriverIO
- **Driver**: tauri-driver + WebKitWebDriver
- **Target**: Compiled Tauri application (`src-tauri/target/release/msigd-gui`)

## Test Environment Modes

### 1. Mock Mode (CI/Development)
- No physical MSI monitor required
- Backend returns simulated responses
- Tests verify UI state changes and API call attempts
- Toast messages indicate success/failure

### 2. Hardware Mode (Integration)
- Real MSI monitor connected via USB
- Tests verify actual monitor settings change
- Requires `msigd` binary available in PATH

## UI Controls Inventory

### Sliders (6 total)

| Location | Control | Test ID | Range | API Function |
|----------|---------|---------|-------|--------------|
| Display | Brightness | `slider-brightness` | 0-100 | `setBrightness()` |
| Display | Contrast | `slider-contrast` | 0-100 | `setContrast()` |
| Display | Sharpness | `slider-sharpness` | 0-5 | `setSharpness()` |
| Color | Red | `slider-red` | 0-100 | `setColorRgb()` |
| Color | Green | `slider-green` | 0-100 | `setColorRgb()` |
| Color | Blue | `slider-blue` | 0-100 | `setColorRgb()` |

### Toggles (4 total)

| Location | Control | Test ID | API Function |
|----------|---------|---------|--------------|
| Display | Eye Saver Mode | `toggle-eye-saver-mode` | `setEyeSaver()` |
| Advanced | HDCR | `toggle-hdcr-high-dynamic-contrast` | `setHdcr()` |
| Advanced | Show Refresh Rate | `toggle-show-refresh-rate` | `setRefreshRateDisplay()` |

### Selects (4 total)

| Location | Control | Test ID | Options | API Function |
|----------|---------|---------|---------|--------------|
| Display | Response Time | `select-response-time` | normal, fast, fastest | `setResponseTime()` |
| Color | Color Preset | `select-color-preset` | cool, normal, warm, custom | `setColorPreset()` |
| LED | LED Mode | `select-led-mode` | off, static, breathing, etc. | `setMysticLight()` |
| Advanced | Image Enhancement | `select-image-enhancement` | off, weak, medium, strong, strongest | `setImageEnhancement()` |

### Buttons (1 total)

| Location | Control | Test ID | Action |
|----------|---------|---------|--------|
| LED | Apply LED Settings | `apply-led-button` | Applies LED configuration |

### Color Pickers (2 total)

| Location | Control | Test ID | Purpose |
|----------|---------|---------|---------|
| LED | Primary Color | `led-color-primary` | Main LED color |
| LED | Secondary Color | `led-color-secondary` | Secondary color (for dual-color modes) |

---

## Test Cases

### 1. Display View Tests

#### 1.1 Brightness Slider
```
Test: Adjust brightness slider
Steps:
  1. Navigate to Display tab
  2. Get current brightness value
  3. Set slider to new value (e.g., 75)
  4. Verify slider input shows new value
  5. Verify displayed value updates
  6. Verify no error toast appears (or success toast if implemented)
Expected: Brightness value changes to 75, UI reflects change
```

#### 1.2 Contrast Slider
```
Test: Adjust contrast slider
Steps:
  1. Navigate to Display tab
  2. Get current contrast value
  3. Set slider to new value (e.g., 50)
  4. Verify slider input shows new value
Expected: Contrast value changes to 50
```

#### 1.3 Sharpness Slider
```
Test: Adjust sharpness slider
Steps:
  1. Navigate to Display tab
  2. Set slider to each value: 0, 1, 2, 3, 4, 5
  3. Verify slider accepts only valid range
Expected: Sharpness cycles through valid values
```

#### 1.4 Response Time Select
```
Test: Change response time setting
Steps:
  1. Navigate to Display tab
  2. Select "fast" option
  3. Verify select shows "Fast"
  4. Select "fastest" option
  5. Verify select shows "Fastest"
  6. Select "normal" option
  7. Verify select shows "Normal"
Expected: Each selection updates UI immediately
```

#### 1.5 Eye Saver Toggle
```
Test: Toggle eye saver mode
Steps:
  1. Navigate to Display tab
  2. Get current toggle state
  3. Click toggle
  4. Verify state changes (on→off or off→on)
  5. Click toggle again
  6. Verify state reverts
Expected: Toggle state changes on each click
```

### 2. Color View Tests

#### 2.1 Color Preset Select
```
Test: Change color preset
Steps:
  1. Navigate to Color tab
  2. Select "cool" preset
  3. Verify select shows "Cool"
  4. Select "warm" preset
  5. Verify select shows "Warm"
Expected: Preset changes immediately
```

#### 2.2 RGB Sliders
```
Test: Adjust individual RGB channels
Steps:
  1. Navigate to Color tab
  2. Set Red slider to 80
  3. Verify Red value shows 80
  4. Verify color preset changes to "Custom"
  5. Set Green slider to 60
  6. Verify Green value shows 60
  7. Set Blue slider to 40
  8. Verify Blue value shows 40
Expected: RGB values change, preset auto-switches to Custom
```

#### 2.3 RGB Auto-Custom Preset
```
Test: Verify preset changes to Custom when RGB adjusted
Steps:
  1. Navigate to Color tab
  2. Select "Normal" preset
  3. Adjust any RGB slider
  4. Verify preset automatically changes to "Custom"
Expected: Preset becomes Custom when user adjusts RGB manually
```

### 3. LED View Tests

#### 3.1 LED Mode Select
```
Test: Change LED mode
Steps:
  1. Navigate to LED tab
  2. Select each mode and verify:
     - "off" → no color picker visible
     - "static" → primary color picker visible
     - "breathing" → both color pickers visible
     - "rainbow" → no color picker visible
Expected: Color picker visibility matches mode requirements
```

#### 3.2 Color Picker Interaction
```
Test: Change LED colors
Steps:
  1. Navigate to LED tab
  2. Select "static" mode
  3. Click primary color picker
  4. Select new color
  5. Verify color input value changes
Expected: Color picker accepts and displays new color
```

#### 3.3 Apply LED Button
```
Test: Apply LED settings
Steps:
  1. Navigate to LED tab
  2. Select "static" mode
  3. Choose a color
  4. Click "Apply LED Settings" button
  5. Verify success toast appears OR no error toast
Expected: Settings applied, success feedback shown
```

#### 3.4 Dual-Color Modes
```
Test: Configure breathing mode with two colors
Steps:
  1. Navigate to LED tab
  2. Select "breathing" mode
  3. Verify both primary and secondary color pickers visible
  4. Set primary color to red (#ff0000)
  5. Set secondary color to blue (#0000ff)
  6. Click Apply
Expected: Both colors saved, applied successfully
```

### 4. Advanced View Tests

#### 4.1 Image Enhancement Select
```
Test: Change image enhancement level
Steps:
  1. Navigate to Advanced tab
  2. Select each option: off, weak, medium, strong, strongest
  3. Verify select updates for each
Expected: All enhancement levels selectable
```

#### 4.2 HDCR Toggle
```
Test: Toggle HDCR setting
Steps:
  1. Navigate to Advanced tab
  2. Click HDCR toggle
  3. Verify state changes
  4. Click again to revert
Expected: HDCR toggles on/off correctly
```

#### 4.3 Refresh Rate Display Toggle
```
Test: Toggle refresh rate display
Steps:
  1. Navigate to Advanced tab
  2. Click "Show Refresh Rate" toggle
  3. Verify state changes
Expected: Toggle works correctly
```

#### 4.4 Monitor Info Display
```
Test: Verify monitor info section
Steps:
  1. Navigate to Advanced tab
  2. Check Model field exists and has value
  3. Check Serial field exists and has value
  4. Check Firmware field exists
Expected: Monitor information displayed correctly
```

### 5. Cross-Component Tests

#### 5.1 Rapid Setting Changes
```
Test: Rapidly change multiple settings
Steps:
  1. Navigate to Display tab
  2. Quickly adjust brightness 5 times
  3. Verify final value is correct
  4. Verify no error toasts
Expected: All changes processed, final state correct
```

#### 5.2 Tab Switch Preservation
```
Test: Settings preserved across tab switches
Steps:
  1. Navigate to Display tab
  2. Set brightness to 60
  3. Switch to Color tab
  4. Switch back to Display tab
  5. Verify brightness still shows 60
Expected: Settings persist during navigation
```

#### 5.3 Error Handling
```
Test: Graceful error handling
Steps:
  1. (Mock: simulate API error)
  2. Attempt to change a setting
  3. Verify error toast appears
  4. Verify UI remains functional
Expected: Error displayed, app doesn't crash
```

---

## Test Data IDs Reference

### Complete Test ID Mapping

```javascript
// Navigation
'[data-testid="app"]'
'[data-testid="header"]'
'[data-testid="app-title"]'
'[data-testid="monitor-select"]'
'[data-testid="tabs"]'
'[data-testid="tab-display"]'
'[data-testid="tab-color"]'
'[data-testid="tab-led"]'
'[data-testid="tab-advanced"]'
'[data-testid="content"]'

// Display View
'[data-testid="view-display"]'
'[data-testid="slider-brightness"]'
'[data-testid="slider-input-brightness"]'
'[data-testid="slider-value-brightness"]'
'[data-testid="slider-contrast"]'
'[data-testid="slider-input-contrast"]'
'[data-testid="slider-sharpness"]'
'[data-testid="slider-input-sharpness"]'
'[data-testid="select-response-time"]'
'[data-testid="select-input-response-time"]'
'[data-testid="toggle-eye-saver-mode"]'

// Color View
'[data-testid="view-color"]'
'[data-testid="select-color-preset"]'
'[data-testid="select-input-color-preset"]'
'[data-testid="slider-red"]'
'[data-testid="slider-input-red"]'
'[data-testid="slider-green"]'
'[data-testid="slider-input-green"]'
'[data-testid="slider-blue"]'
'[data-testid="slider-input-blue"]'

// LED View
'[data-testid="view-led"]'
'[data-testid="select-led-mode"]'
'[data-testid="select-input-led-mode"]'
'[data-testid="led-colors"]'
'[data-testid="led-color-primary"]'
'[data-testid="led-color-secondary"]'
'[data-testid="apply-led-button"]'

// Advanced View
'[data-testid="view-advanced"]'
'[data-testid="select-image-enhancement"]'
'[data-testid="select-input-image-enhancement"]'
'[data-testid="toggle-hdcr-high-dynamic-contrast"]'
'[data-testid="toggle-show-refresh-rate"]'
'[data-testid="monitor-info"]'
'[data-testid="info-model"]'
'[data-testid="info-serial"]'
'[data-testid="info-firmware"]'

// Status
'[data-testid="loading"]'
'[data-testid="status-no-monitors"]'
```

---

## Implementation Guide

### Slider Interaction Pattern

```typescript
async function testSlider(testId: string, newValue: number) {
  const slider = await $(`[data-testid="slider-${testId}"]`);
  const input = await $(`[data-testid="slider-input-${testId}"]`);

  // Get initial value
  const initialValue = await input.getValue();

  // Set new value
  await input.setValue(newValue.toString());
  await browser.keys('Enter'); // Trigger change event

  // Verify change
  const updatedValue = await input.getValue();
  expect(parseInt(updatedValue)).toBe(newValue);

  // Check for error toast (should not exist)
  const errorToast = await $('[data-testid="toast-error"]');
  expect(await errorToast.isExisting()).toBe(false);
}
```

### Toggle Interaction Pattern

```typescript
async function testToggle(testId: string) {
  const toggle = await $(`[data-testid="toggle-${testId}"]`);

  // Get initial state via aria-pressed or class
  const initialState = await toggle.getAttribute('aria-pressed');

  // Click toggle
  await toggle.click();
  await browser.pause(300); // Wait for state update

  // Verify state changed
  const newState = await toggle.getAttribute('aria-pressed');
  expect(newState).not.toBe(initialState);
}
```

### Select Interaction Pattern

```typescript
async function testSelect(testId: string, optionValue: string) {
  const select = await $(`[data-testid="select-input-${testId}"]`);

  // Change selection
  await select.selectByAttribute('value', optionValue);
  await browser.pause(300);

  // Verify selection
  const selectedValue = await select.getValue();
  expect(selectedValue).toBe(optionValue);
}
```

### Button Click Pattern

```typescript
async function testButton(testId: string) {
  const button = await $(`[data-testid="${testId}"]`);

  // Verify clickable
  expect(await button.isClickable()).toBe(true);

  // Click
  await button.click();
  await browser.pause(500);

  // Check for success indication (toast or state change)
  const successToast = await $('[data-testid="toast-success"]');
  if (await successToast.isExisting()) {
    await expect(successToast).toBeDisplayed();
  }
}
```

---

## Running Tests

```bash
# Build the app first
npm run tauri build

# Run all E2E tests
npm run test:wdio

# Run specific test file
npx wdio run ./wdio.conf.ts --spec tests/e2e/interactive.spec.ts
```

---

## Test Coverage Goals

| Category | Tests | Priority |
|----------|-------|----------|
| Slider Interactions | 6 | High |
| Toggle Interactions | 3 | High |
| Select Interactions | 4 | High |
| Button Interactions | 1 | High |
| Color Picker Interactions | 2 | Medium |
| Cross-Component | 3 | Medium |
| Error Handling | 2 | Medium |
| **Total** | **21** | - |

Combined with existing 34 structure tests = **55 total tests**

---

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparison for UI consistency
2. **Performance Metrics**: Measure response time for each operation
3. **Accessibility Testing**: Verify keyboard navigation and screen reader support
4. **Mock Backend Mode**: Create mock Tauri commands for CI testing without hardware
