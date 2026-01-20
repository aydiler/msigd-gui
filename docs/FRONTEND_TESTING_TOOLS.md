# Frontend Testing Tools Comparison for MSI Monitor Control GUI

This document compares different tools for testing the frontend of the Tauri + Svelte 5 application.

---

## Important: What Testing Does and Doesn't Do

| Testing Method | What It Tests | Controls Real Monitor? |
|----------------|---------------|------------------------|
| **Playwright tests** | UI interactions, navigation, components | **No** - uses mocked Tauri API |
| **Browser testing (Chrome)** | UI visually in browser | **No** - requires mock injection |
| **WebdriverIO + tauri-driver** | Full app including Tauri backend | **Yes** - but requires WebKitWebDriver |
| **`npm run tauri dev`** | Full app with real hardware | **Yes** - real USB commands |

### Why Browser Tests Don't Control the Monitor

The MSI Monitor Control app uses a **Tauri architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri App                            │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │  Svelte Frontend │ ──► │  Rust Backend           │  │
│  │  (WebView)       │     │  (USB communication)    │  │
│  └─────────────────┘      └───────────┬─────────────┘  │
│                                       │                 │
└───────────────────────────────────────┼─────────────────┘
                                        ▼
                                 ┌─────────────┐
                                 │ MSI Monitor │
                                 │ (via USB)   │
                                 └─────────────┘
```

- **Browser tests** only have the Svelte frontend - no Rust backend
- **Tauri API calls** (`invoke`) fail without the Tauri runtime
- **Mock injection** simulates API responses but doesn't send USB commands

### To Test Real Monitor Control

Run the actual Tauri application:

```bash
npm run tauri dev
```

This opens a native window with the full Rust backend that can communicate with your MSI monitor via USB.

### When to Use Each Method

| Use Case | Recommended Method |
|----------|-------------------|
| Check if UI components render correctly | `npm test` (Playwright) |
| Verify tab navigation works | `npm test` (Playwright) |
| Test slider/toggle interactions | `npm test` (Playwright) |
| Verify real brightness changes on monitor | `npm run tauri dev` |
| Debug USB communication issues | `npm run tauri dev` |
| CI/CD automated UI regression | `npm test` (Playwright) |
| Manual exploratory testing | `npm run tauri dev` |

---

## Application Overview

**UI Elements to Test:**
- **Sliders**: Brightness, Contrast, Sharpness, RGB values (debounced 150ms)
- **Toggles**: Eye Saver Mode, HDCR, Show Refresh Rate
- **Select dropdowns**: Monitor selector, Response Time, Color Preset, LED Mode, Image Enhancement
- **Color pickers**: LED primary/secondary colors
- **Buttons**: Tab navigation, Apply LED Settings, Retry
- **Toast notifications**: Auto-hiding success/error messages

---

## Testing Tool Comparison

### 1. Playwright

**Type:** Browser automation / E2E testing
**Language:** JavaScript/TypeScript, Python, .NET, Java
**Website:** https://playwright.dev

**Pros:**
- Cross-browser support (Chromium, Firefox, WebKit/Safari)
- Built-in parallel execution (no paid service needed)
- Auto-waiting for elements
- Trace viewer for debugging
- Codegen for recording tests
- Excellent for testing the web frontend in isolation

**Cons:**
- **Tauri APIs don't work** - can only test the web layer, not Tauri commands
- Cannot test actual monitor communication
- Requires mocking Tauri invoke calls

**Best for:** Testing UI interactions, component behavior, visual regression

**Example setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// tests/display.spec.ts
import { test, expect } from '@playwright/test';

test('brightness slider changes value', async ({ page }) => {
  await page.goto('http://localhost:1420');
  const slider = page.locator('input[type="range"]').first();
  await slider.fill('75');
  await expect(page.getByText('75%')).toBeVisible();
});
```

---

### 2. Cypress

**Type:** Browser automation / E2E + Component testing
**Language:** JavaScript/TypeScript
**Website:** https://www.cypress.io

**Pros:**
- Interactive GUI with time-travel debugging
- Real-time test execution feedback
- Component testing support for Svelte
- Large community and ecosystem
- Excellent developer experience

**Cons:**
- Limited browser support (Chrome, Firefox, Edge - no Safari)
- Parallel runs require Cypress Cloud (paid) or external tooling
- Same Tauri API limitations as Playwright
- Slightly slower than Playwright

**Best for:** Developer-friendly testing with visual feedback

**Example setup:**
```bash
npm install -D cypress
npx cypress open
```

```typescript
// cypress/e2e/display.cy.ts
describe('Display View', () => {
  it('adjusts brightness slider', () => {
    cy.visit('http://localhost:1420');
    cy.get('input[type="range"]').first()
      .invoke('val', 75)
      .trigger('input');
    cy.contains('75%').should('be.visible');
  });
});
```

---

### 3. WebdriverIO + tauri-driver

**Type:** Desktop GUI E2E testing
**Language:** JavaScript/TypeScript
**Website:** https://webdriver.io + https://tauri.app/develop/tests/webdriver

**Pros:**
- **Official Tauri support** via `tauri-driver`
- Tests the actual compiled application
- Can test Tauri API calls (monitor commands)
- Cross-platform (Windows, macOS, Linux)
- Uses WebDriver protocol (industry standard)

**Cons:**
- More complex setup
- Slower test execution (launches full app)
- Requires building the app before testing
- Less interactive debugging than Cypress

**Best for:** Full integration testing including Tauri backend

**Example setup:**
```bash
npm install -D @wdio/cli
npx wdio config
cargo install tauri-driver
```

```typescript
// wdio.conf.ts
export const config = {
  runner: 'local',
  specs: ['./tests/**/*.spec.ts'],
  capabilities: [{
    'tauri:options': {
      application: './src-tauri/target/release/msigd-gui'
    }
  }]
};
```

```typescript
// tests/monitor.spec.ts
describe('Monitor Control', () => {
  it('loads monitors on startup', async () => {
    const dropdown = await $('select');
    await dropdown.waitForExist();
    const options = await $$('select option');
    expect(options.length).toBeGreaterThan(0);
  });
});
```

---

### 4. Vitest + @testing-library/svelte

**Type:** Unit/Component testing
**Language:** JavaScript/TypeScript
**Website:** https://vitest.dev + https://testing-library.com/svelte

**Pros:**
- Fast unit tests
- Tests components in isolation
- Integrates with Vite (already used)
- No browser needed for basic tests
- Great for testing component logic

**Cons:**
- Not E2E - doesn't test full user flows
- Cannot test visual appearance
- Requires mocking everything outside the component

**Best for:** Component logic, state management, utilities

**Example setup:**
```bash
npm install -D vitest @testing-library/svelte jsdom
```

```typescript
// src/lib/components/Slider.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Slider from './Slider.svelte';

describe('Slider', () => {
  it('calls onChange when value changes', async () => {
    const onChange = vi.fn();
    const { getByRole } = render(Slider, {
      props: { label: 'Test', value: 50, min: 0, max: 100, onChange }
    });

    const slider = getByRole('slider');
    await fireEvent.input(slider, { target: { value: 75 } });

    // Wait for debounce
    await new Promise(r => setTimeout(r, 200));
    expect(onChange).toHaveBeenCalledWith(75);
  });
});
```

---

### 5. Claude-in-Chrome (MCP Browser Automation)

**Type:** AI-assisted manual/exploratory testing
**Language:** Natural language
**Availability:** Built into this development environment

**Pros:**
- No setup required
- Can interact with running dev server
- Visual feedback via screenshots
- Natural language test descriptions
- Good for exploratory testing

**Cons:**
- Not automated/repeatable
- Cannot run in CI/CD
- Requires dev server running
- Limited to what's visible in browser

**Best for:** Quick manual testing, visual verification, exploratory testing

**Example usage:**
```
"Click the Color tab and adjust the red slider to 80"
"Verify the LED mode dropdown has all expected options"
"Check that the toast notification appears after changing brightness"
```

---

## Comparison Matrix

| Feature | Playwright | Cypress | WebdriverIO | Vitest | Claude-in-Chrome |
|---------|------------|---------|-------------|--------|------------------|
| Setup Complexity | Low | Low | Medium | Low | None |
| Tauri API Testing | No | No | **Yes** | Mock only | No |
| Browser Support | All | Limited | All | N/A | Chrome |
| Parallel Execution | Built-in | Paid | Built-in | Built-in | N/A |
| CI/CD Ready | Yes | Yes | Yes | Yes | No |
| Interactive Debug | Good | **Best** | Limited | Good | Visual |
| Component Testing | No | Yes | No | **Yes** | No |
| Speed | Fast | Medium | Slow | **Fastest** | Manual |
| Visual Testing | Plugin | Plugin | Plugin | No | **Yes** |

---

## Recommended Testing Strategy

### For This Project (MSI Monitor Control GUI)

**Layer 1: Unit Tests (Vitest + Testing Library)**
- Test individual components (Slider, Toggle, Select)
- Test state management logic
- Test utility functions
- Run on every commit

**Layer 2: Web E2E Tests (Playwright)**
- Test full user flows in browser
- Mock Tauri invoke calls
- Test UI interactions and visual regression
- Run on PR/merge

**Layer 3: Integration Tests (WebdriverIO + tauri-driver)**
- Test with actual Tauri backend
- Verify monitor communication works
- Run before release

**Layer 4: Manual/Exploratory (Claude-in-Chrome)**
- Quick visual checks during development
- Exploratory testing of edge cases
- UI/UX verification

---

## Quick Start: Minimal Setup

For a project this size, I recommend starting with:

### 1. Vitest for components
```bash
npm install -D vitest @testing-library/svelte jsdom @sveltejs/vite-plugin-svelte
```

### 2. Playwright for E2E
```bash
npm install -D @playwright/test
npx playwright install chromium
```

### 3. Add test scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Conclusion

For testing this Tauri + Svelte application:

1. **Start with Vitest** for fast component tests during development
2. **Add Playwright** for browser-based E2E tests with mocked Tauri calls
3. **Consider WebdriverIO** later for full integration testing if needed
4. **Use Claude-in-Chrome** for quick manual verification during development

The main limitation is that Playwright/Cypress cannot test actual Tauri commands - they only see the web layer. For true end-to-end testing including monitor communication, WebdriverIO with tauri-driver is the only option.

---

## Playwright Setup (Implemented & Working)

This project uses **Playwright** for frontend E2E testing. Tests run against the Vite dev server with mocked Tauri API calls.

### Why Playwright?

- **Works immediately** on Linux without additional dependencies
- WebdriverIO + tauri-driver requires `WebKitWebDriver` which is not available on Arch Linux
- Playwright provides faster test execution and better debugging experience

### Installation

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI mode (interactive)
npm run test:ui

# Run headed (see the browser)
npm run test:headed
```

### Test Results (46 tests passing)

```
  46 passed (7.4s)
```

### Project Structure

```
msigd-gui/
├── playwright.config.ts       # Playwright configuration
├── tests/
│   └── playwright/
│       ├── fixtures.ts        # Tauri API mocks
│       ├── app.spec.ts        # Application-level tests (11 tests)
│       ├── display.spec.ts    # Display view tests (12 tests)
│       ├── color.spec.ts      # Color view tests (8 tests)
│       ├── led.spec.ts        # LED view tests (7 tests)
│       └── advanced.spec.ts   # Advanced view tests (12 tests)
```

### How It Works

1. **Tauri API Mocking**: The `fixtures.ts` file injects mock Tauri API responses before each test
2. **Dev Server**: Playwright automatically starts `npm run dev` before tests
3. **Chromium Browser**: Tests run in headless Chromium

### Writing New Tests

```typescript
import { test, expect } from './fixtures';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.my-view');
  });

  test('should do something', async ({ page }) => {
    const button = page.locator('button', { hasText: 'Click Me' });
    await button.click();
    await expect(page.locator('.result')).toHaveText('Success');
  });
});
```

### Debugging Tips

```bash
# Run with UI for visual debugging
npm run test:ui

# Run headed to see the browser
npm run test:headed

# Run specific test file
npx playwright test tests/playwright/display.spec.ts

# Debug mode
npx playwright test --debug
```

---

## WebdriverIO + tauri-driver Setup

WebdriverIO with tauri-driver provides full E2E testing of the real Tauri application.

### Prerequisites

1. **WebKitWebDriver** - See "WebKitWebDriver Setup by Platform" above
2. **tauri-driver** - `cargo install tauri-driver`
3. **Node.js 18+** - For WebdriverIO

### Installation

```bash
# Install WebdriverIO dependencies (already in package.json)
npm install

# Install tauri-driver
cargo install tauri-driver

# Verify WebKitWebDriver
which WebKitWebDriver
```

### Project Structure

```
msigd-gui/
├── wdio.conf.ts              # WebdriverIO configuration
├── tests/
│   ├── tsconfig.json         # TypeScript config for tests
│   └── e2e/
│       └── app.spec.ts       # E2E tests
```

### Running Tests

```bash
# 1. Build the application (required)
npm run tauri build

# 2. Run E2E tests
npm run test:wdio
```

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Execution                            │
│                                                                  │
│  WebdriverIO ──► tauri-driver ──► WebKitWebDriver ──► Tauri App │
│  (test code)    (port 4444)       (webkit)           (wry)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

1. **WebdriverIO** runs test code and sends WebDriver commands
2. **tauri-driver** proxies commands to WebKitWebDriver
3. **WebKitWebDriver** controls the WebKit webview
4. **Tauri App** responds to interactions (including real Rust backend)

### Writing Tests

Use `data-testid` attributes for stable selectors:

```typescript
// tests/e2e/example.spec.ts
describe('My Feature', () => {
  it('should do something', async () => {
    // Best: Use data-testid (stable)
    const button = await $('[data-testid="submit-button"]');
    await button.click();

    // Assert with built-in matchers
    await expect($('[data-testid="result"]')).toHaveText('Success');
  });
});
```

### Selector Best Practices

```typescript
// ✅ Good - Stable selectors
await $('[data-testid="monitor-select"]')
await $('[data-testid="tab-display"]')
await $('#unique-id')

// ❌ Avoid - Fragile selectors
await $('.some-class')
await $('div > span:nth-child(2)')
```

### Debugging

```typescript
// Pause for inspection
await browser.pause(5000);

// Take screenshot
await browser.saveScreenshot('./debug.png');

// Log element info
const el = await $('[data-testid="button"]');
console.log(await el.getText());
```

### CI/CD (GitHub Actions)

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: dtolnay/rust-toolchain@stable

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-driver xvfb

      - name: Install project dependencies
        run: |
          npm ci
          cargo install tauri-driver

      - name: Build application
        run: npm run tauri build

      - name: Run E2E tests
        run: xvfb-run npm run test:wdio
```

---

## Real Hardware Testing Options

For testing the actual Tauri app with real monitor control, there are several approaches:

### WebKitWebDriver on Linux

WebdriverIO + tauri-driver requires **WebKitWebDriver** on Linux:

- **Arch Linux**: Install `webkitgtk-6.0` (includes WebKitWebDriver)
- **Debian/Ubuntu**: Install `webkit2gtk-driver` package
- Both provide `/usr/bin/WebKitWebDriver`

### Recommended Testing Approach

```
┌────────────────────────────────────────────────────────────────┐
│  Testing Workflow                                               │
│                                                                 │
│  1. Playwright (npm test)     → Fast UI regression tests       │
│                                  (mocked Tauri API, 46 tests)   │
│                                                                 │
│  2. WebdriverIO (npm run      → Real E2E tests with Tauri      │
│     test:wdio)                  backend (10 tests)              │
│                                                                 │
│  3. Manual (npm run tauri dev)→ Test with real monitor         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Quick Reference

| Option | Effort | Platform |
|--------|--------|----------|
| Install `webkitgtk-6.0` package | **Low** | Arch Linux (see below) |
| Install `webkit2gtk-driver` package | Low | Debian/Ubuntu |
| Use Ubuntu CI runner | Low | GitHub Actions |

### Hardware Test Scripts (Experimental)

The `tests/hardware/` directory contains experimental kdotool/ydotool-based tests. However, coordinate-based automation is unreliable on Wayland and is **not recommended** for regular use.

```bash
# Available but unreliable
npm run test:hardware          # Run all hardware tests
npm run test:hardware:display  # Display tests only
```

See `tests/hardware/README.md` for details.

---

## WebKitWebDriver Setup by Platform

WebKitWebDriver is required for full E2E testing with WebdriverIO + tauri-driver.

### Arch Linux

**Good news:** WebKitWebDriver is included in the `webkitgtk-6.0` package!

```bash
# Install the package (includes WebKitWebDriver)
sudo pacman -S webkitgtk-6.0

# Verify installation
which WebKitWebDriver
# Output: /usr/bin/WebKitWebDriver
```

That's it - no building from source required.

### Debian/Ubuntu

```bash
# Install the webkit2gtk-driver package
sudo apt install webkit2gtk-driver

# Verify installation
which WebKitWebDriver
```

### Verify WebKitWebDriver Works

```bash
WebKitWebDriver --help
```

### Using with tauri-driver

```bash
# Install tauri-driver
cargo install tauri-driver

# Build your Tauri app
npm run tauri build

# Run E2E tests
npm run test:wdio
```

---

## Sources

- [Cypress vs Playwright Comparison](https://www.accelq.com/blog/cypress-vs-playwright/)
- [Cypress vs Playwright in 2026](https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/)
- [Tauri E2E Testing Discussion](https://github.com/orgs/tauri-apps/discussions/3768)
- [Best UI Testing Tools 2026](https://www.virtuosoqa.com/post/best-ui-testing-tools)
- [Svelte Testing with testRigor](https://testrigor.com/svelte-testing/)
- [WebKitGTK Official Site](https://webkitgtk.org/)
- [WebKitGTK Build Instructions - Linux From Scratch](https://www.linuxfromscratch.org/blfs/view/svn/x/webkitgtk.html)
- [BuildingGtk - WebKit Wiki](https://trac.webkit.org/wiki/BuildingGtk)
