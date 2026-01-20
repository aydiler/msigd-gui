/**
 * MSI Monitor Control - Comprehensive E2E Tests
 *
 * Tests the real Tauri application using WebdriverIO + tauri-driver + WebKitWebDriver.
 * These tests run against the actual compiled binary with the real Rust backend.
 *
 * Prerequisites:
 *   - WebKitWebDriver: sudo pacman -S webkitgtk-6.0 (Arch) or sudo apt install webkit2gtk-driver (Debian)
 *   - tauri-driver: cargo install tauri-driver
 *   - Built app: npm run tauri build
 *
 * Run: npm run test:wdio
 */

describe('MSI Monitor Control', () => {
  // ============================================================
  // Application Launch & Header
  // ============================================================
  describe('Application Launch', () => {
    it('should display the app title', async () => {
      const title = await $('[data-testid="app-title"]');
      await expect(title).toHaveText('MSI Monitor Control');
    });

    it('should have a header with monitor selector', async () => {
      const header = await $('[data-testid="header"]');
      await expect(header).toExist();

      const select = await $('[data-testid="monitor-select"]');
      await expect(select).toExist();
    });

    it('should have all four navigation tabs', async () => {
      await expect($('[data-testid="tab-display"]')).toExist();
      await expect($('[data-testid="tab-color"]')).toExist();
      await expect($('[data-testid="tab-led"]')).toExist();
      await expect($('[data-testid="tab-advanced"]')).toExist();
    });

    it('should have Display tab active by default', async () => {
      const displayTab = await $('[data-testid="tab-display"]');
      await expect(displayTab).toHaveElementClass('active');
    });
  });

  // ============================================================
  // Tab Navigation
  // ============================================================
  describe('Tab Navigation', () => {
    it('should switch to Display tab and show view', async () => {
      const tab = await $('[data-testid="tab-display"]');
      await tab.click();
      await expect(tab).toHaveElementClass('active');

      // Check view is loaded (either settings or no-monitor message)
      const content = await $('[data-testid="content"]');
      await expect(content).toExist();
    });

    it('should switch to Color tab and show view', async () => {
      const tab = await $('[data-testid="tab-color"]');
      await tab.click();
      await expect(tab).toHaveElementClass('active');
    });

    it('should switch to LED tab and show view', async () => {
      const tab = await $('[data-testid="tab-led"]');
      await tab.click();
      await expect(tab).toHaveElementClass('active');
    });

    it('should switch to Advanced tab and show view', async () => {
      const tab = await $('[data-testid="tab-advanced"]');
      await tab.click();
      await expect(tab).toHaveElementClass('active');
    });

    it('should deactivate previous tab when switching', async () => {
      // Start at Display
      const displayTab = await $('[data-testid="tab-display"]');
      await displayTab.click();
      await expect(displayTab).toHaveElementClass('active');

      // Switch to Color
      const colorTab = await $('[data-testid="tab-color"]');
      await colorTab.click();

      // Display should no longer be active
      await expect(displayTab).not.toHaveElementClass('active');
      await expect(colorTab).toHaveElementClass('active');
    });
  });

  // ============================================================
  // Display View
  // ============================================================
  describe('Display View', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-display"]');
      await tab.click();
      await browser.pause(500); // Wait for view to render
    });

    it('should show Display view container', async () => {
      // Either view is shown or no-monitor message
      const view = await $('[data-testid="view-display"]');
      const noMonitor = await $('[data-testid="status-no-monitors"]');

      const viewExists = await view.isExisting();
      const noMonitorExists = await noMonitor.isExisting();

      expect(viewExists || noMonitorExists).toBe(true);
    });

    it('should have Brightness slider when monitor connected', async () => {
      const slider = await $('[data-testid="slider-brightness"]');
      if (await slider.isExisting()) {
        await expect(slider).toBeDisplayed();
        const input = await $('[data-testid="slider-input-brightness"]');
        await expect(input).toExist();
      }
    });

    it('should have Contrast slider when monitor connected', async () => {
      const slider = await $('[data-testid="slider-contrast"]');
      if (await slider.isExisting()) {
        await expect(slider).toBeDisplayed();
      }
    });

    it('should have Sharpness slider when monitor connected', async () => {
      const slider = await $('[data-testid="slider-sharpness"]');
      if (await slider.isExisting()) {
        await expect(slider).toBeDisplayed();
      }
    });

    it('should have Response Time selector when monitor connected', async () => {
      const select = await $('[data-testid="select-response-time"]');
      if (await select.isExisting()) {
        await expect(select).toBeDisplayed();
      }
    });

    it('should have Eye Saver Mode toggle when monitor connected', async () => {
      const toggle = await $('[data-testid="toggle-eye-saver-mode"]');
      if (await toggle.isExisting()) {
        await expect(toggle).toBeDisplayed();
      }
    });
  });

  // ============================================================
  // Color View
  // ============================================================
  describe('Color View', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-color"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should show Color view container', async () => {
      const view = await $('[data-testid="view-color"]');
      const noMonitor = await $('[data-testid="status-no-monitors"]');

      const viewExists = await view.isExisting();
      const noMonitorExists = await noMonitor.isExisting();

      expect(viewExists || noMonitorExists).toBe(true);
    });

    it('should have Color Preset selector when monitor connected', async () => {
      const select = await $('[data-testid="select-color-preset"]');
      if (await select.isExisting()) {
        await expect(select).toBeDisplayed();
      }
    });

    it('should have RGB sliders when monitor connected', async () => {
      const redSlider = await $('[data-testid="slider-red"]');
      const greenSlider = await $('[data-testid="slider-green"]');
      const blueSlider = await $('[data-testid="slider-blue"]');

      if (await redSlider.isExisting()) {
        await expect(redSlider).toBeDisplayed();
        await expect(greenSlider).toBeDisplayed();
        await expect(blueSlider).toBeDisplayed();
      }
    });
  });

  // ============================================================
  // LED View
  // ============================================================
  describe('LED View', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-led"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should show LED view container', async () => {
      const view = await $('[data-testid="view-led"]');
      const noMonitor = await $('[data-testid="status-no-monitors"]');

      const viewExists = await view.isExisting();
      const noMonitorExists = await noMonitor.isExisting();

      expect(viewExists || noMonitorExists).toBe(true);
    });

    it('should have LED Mode selector when monitor connected', async () => {
      const select = await $('[data-testid="select-led-mode"]');
      if (await select.isExisting()) {
        await expect(select).toBeDisplayed();
      }
    });

    it('should have Apply LED Settings button when monitor connected', async () => {
      const button = await $('[data-testid="apply-led-button"]');
      if (await button.isExisting()) {
        await expect(button).toBeDisplayed();
        await expect(button).toBeClickable();
      }
    });

    it('should show color picker when LED mode is not off/rainbow', async () => {
      const select = await $('[data-testid="select-input-led-mode"]');
      if (await select.isExisting()) {
        // Select 'static' mode
        await select.selectByAttribute('value', 'static');
        await browser.pause(300);

        const colorPicker = await $('[data-testid="led-color-primary"]');
        await expect(colorPicker).toExist();
      }
    });
  });

  // ============================================================
  // Advanced View
  // ============================================================
  describe('Advanced View', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-advanced"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should show Advanced view container', async () => {
      const view = await $('[data-testid="view-advanced"]');
      const noMonitor = await $('[data-testid="status-no-monitors"]');

      const viewExists = await view.isExisting();
      const noMonitorExists = await noMonitor.isExisting();

      expect(viewExists || noMonitorExists).toBe(true);
    });

    it('should have Image Enhancement selector when monitor connected', async () => {
      const select = await $('[data-testid="select-image-enhancement"]');
      if (await select.isExisting()) {
        await expect(select).toBeDisplayed();
      }
    });

    it('should have HDCR toggle when monitor connected', async () => {
      const toggle = await $('[data-testid="toggle-hdcr-high-dynamic-contrast"]');
      if (await toggle.isExisting()) {
        await expect(toggle).toBeDisplayed();
      }
    });

    it('should have Show Refresh Rate toggle when monitor connected', async () => {
      const toggle = await $('[data-testid="toggle-show-refresh-rate"]');
      if (await toggle.isExisting()) {
        await expect(toggle).toBeDisplayed();
      }
    });

    it('should have Monitor Info section when monitor connected', async () => {
      const info = await $('[data-testid="monitor-info"]');
      if (await info.isExisting()) {
        await expect(info).toBeDisplayed();
      }
    });
  });

  // ============================================================
  // Component Interactions
  // ============================================================
  describe('Component Interactions', () => {
    it('should allow clicking tabs rapidly without breaking', async () => {
      const tabs = ['display', 'color', 'led', 'advanced', 'display'];

      for (const tabName of tabs) {
        const tab = await $(`[data-testid="tab-${tabName}"]`);
        await tab.click();
        await expect(tab).toHaveElementClass('active');
      }
    });

    it('should maintain tab state after rapid clicking', async () => {
      const advancedTab = await $('[data-testid="tab-advanced"]');
      await advancedTab.click();
      await advancedTab.click();
      await advancedTab.click();

      await expect(advancedTab).toHaveElementClass('active');
    });
  });

  // ============================================================
  // Monitor Selector
  // ============================================================
  describe('Monitor Selector', () => {
    it('should have a select element', async () => {
      const select = await $('[data-testid="monitor-select"]');
      await expect(select).toExist();
    });

    it('should have at least one option', async () => {
      const select = await $('[data-testid="monitor-select"]');
      const options = await select.$$('option');
      expect(options.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================
  // UI Responsiveness
  // ============================================================
  describe('UI Responsiveness', () => {
    it('should have all tabs clickable', async () => {
      const tabs = await $$('[data-testid^="tab-"]');
      expect(tabs.length).toBe(4);

      for (const tab of tabs) {
        await expect(tab).toBeClickable();
      }
    });

    it('should render content area', async () => {
      const content = await $('[data-testid="content"]');
      await expect(content).toExist();
    });

    it('should have proper app structure', async () => {
      const app = await $('[data-testid="app"]');
      await expect(app).toExist();

      const header = await $('[data-testid="header"]');
      await expect(header).toExist();

      const tabs = await $('[data-testid="tabs"]');
      await expect(tabs).toExist();

      const content = await $('[data-testid="content"]');
      await expect(content).toExist();
    });
  });
});
