/**
 * MSI Monitor Control - Interactive E2E Tests
 *
 * Tests actual user interactions with all UI controls:
 * - Sliders: Adjust values and verify changes
 * - Toggles: Click and verify state changes
 * - Selects: Change options and verify selections
 * - Buttons: Click and verify actions
 * - Color Pickers: Change colors and verify updates
 *
 * These tests go beyond existence checks to verify that
 * controls respond correctly to user input.
 *
 * Run: npm run test:wdio
 */

describe('MSI Monitor Control - Interactive Tests', () => {
  /**
   * Helper to set a range slider value using JavaScript
   * WebdriverIO's setValue() doesn't work well with range inputs
   */
  async function setSliderValue(testId: string, value: number): Promise<void> {
    const selector = `[data-testid="slider-input-${testId}"]`;
    await browser.execute(
      (sel: string, val: number) => {
        const el = document.querySelector(sel) as HTMLInputElement;
        if (el) {
          el.value = String(val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      selector,
      value
    );
    await browser.pause(200); // Wait for debounce
  }

  /**
   * Helper to get a slider's current value
   */
  async function getSliderValue(testId: string): Promise<number> {
    const selector = `[data-testid="slider-input-${testId}"]`;
    const value = await browser.execute((sel: string) => {
      const el = document.querySelector(sel) as HTMLInputElement;
      return el ? parseInt(el.value, 10) : -1;
    }, selector);
    return value;
  }

  /**
   * Helper to set a color input value
   */
  async function setColorValue(testId: string, color: string): Promise<void> {
    const selector = `[data-testid="${testId}"]`;
    await browser.execute(
      (sel: string, val: string) => {
        const el = document.querySelector(sel) as HTMLInputElement;
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      selector,
      color
    );
    await browser.pause(200);
  }

  /**
   * Helper to get color input value
   */
  async function getColorValue(testId: string): Promise<string> {
    const selector = `[data-testid="${testId}"]`;
    const value = await browser.execute((sel: string) => {
      const el = document.querySelector(sel) as HTMLInputElement;
      return el ? el.value : '';
    }, selector);
    return value;
  }

  /**
   * Helper to assert no error toast is displayed
   * Call this after any action that triggers an API call
   */
  async function assertNoErrorToast(): Promise<void> {
    await browser.pause(300); // Wait for potential toast to appear
    const errorToast = await $('[data-testid="toast-error"]');
    const exists = await errorToast.isExisting();
    if (exists) {
      const message = await errorToast.getText();
      throw new Error(`Unexpected error toast: "${message}"`);
    }
  }

  /**
   * Helper to clear any existing toast
   */
  async function clearToast(): Promise<void> {
    await browser.execute(() => {
      const toast = document.querySelector('[data-testid^="toast-"]');
      if (toast) toast.remove();
    });
  }

  // ============================================================
  // Display View - Slider Interactions
  // ============================================================
  describe('Display View - Slider Interactions', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-display"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should adjust brightness slider and verify value changes', async () => {
      const input = await $('[data-testid="slider-input-brightness"]');
      if (!(await input.isExisting())) return;

      const initialValue = await getSliderValue('brightness');
      const newValue = initialValue === 50 ? 75 : 50;

      await setSliderValue('brightness', newValue);
      await assertNoErrorToast(); // Verify no msigd error

      const updatedValue = await getSliderValue('brightness');
      expect(updatedValue).toBe(newValue);

      // Verify displayed value also updated
      const displayedValue = await $('[data-testid="slider-value-brightness"]');
      const text = await displayedValue.getText();
      expect(text).toContain(String(newValue));
    });

    it('should adjust contrast slider and verify value changes', async () => {
      const input = await $('[data-testid="slider-input-contrast"]');
      if (!(await input.isExisting())) return;

      const initialValue = await getSliderValue('contrast');
      const newValue = initialValue === 50 ? 70 : 50;

      await setSliderValue('contrast', newValue);
      await assertNoErrorToast(); // Verify no msigd error

      const updatedValue = await getSliderValue('contrast');
      expect(updatedValue).toBe(newValue);
    });

    it('should adjust sharpness slider within valid range (0-5)', async () => {
      const input = await $('[data-testid="slider-input-sharpness"]');
      if (!(await input.isExisting())) return;

      // Test each valid value
      for (const testValue of [0, 2, 5]) {
        await setSliderValue('sharpness', testValue);
        await assertNoErrorToast(); // Verify no msigd error

        const value = await getSliderValue('sharpness');
        expect(value).toBe(testValue);
      }
    });

    it('should change response time selection', async () => {
      const select = await $('[data-testid="select-input-response-time"]');
      if (!(await select.isExisting())) return;

      const options = ['normal', 'fast', 'fastest'];
      for (const option of options) {
        await select.selectByAttribute('value', option);
        await browser.pause(300);
        await assertNoErrorToast(); // Verify no msigd error

        const selectedValue = await select.getValue();
        expect(selectedValue).toBe(option);
      }
    });

    it('should toggle eye saver mode on and off', async () => {
      const toggle = await $('[data-testid="toggle-eye-saver-mode"]');
      if (!(await toggle.isExisting())) return;

      // Get initial state from aria-checked attribute (Toggle uses role="switch")
      const getToggleState = async (): Promise<boolean> => {
        const ariaChecked = await toggle.getAttribute('aria-checked');
        return ariaChecked === 'true';
      };

      // Verify the toggle is clickable and responds
      expect(await toggle.isClickable()).toBe(true);

      const initialState = await getToggleState();

      // Click to toggle
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterFirstClick = await getToggleState();
      expect(afterFirstClick).not.toBe(initialState); // State should have changed

      // Click again to revert
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterSecondClick = await getToggleState();
      expect(afterSecondClick).toBe(initialState);
    });
  });

  // ============================================================
  // Color View - Slider and Select Interactions
  // ============================================================
  describe('Color View - Slider and Select Interactions', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-color"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should change color preset selection', async () => {
      const select = await $('[data-testid="select-input-color-preset"]');
      if (!(await select.isExisting())) return;

      const presets = ['cool', 'normal', 'warm', 'custom'];
      for (const preset of presets) {
        await select.selectByAttribute('value', preset);
        await browser.pause(300);
        await assertNoErrorToast(); // Verify no msigd error

        const selectedValue = await select.getValue();
        expect(selectedValue).toBe(preset);
      }
    });

    it('should adjust red color slider', async () => {
      const input = await $('[data-testid="slider-input-red"]');
      if (!(await input.isExisting())) return;

      await setSliderValue('red', 80);
      await assertNoErrorToast(); // Verify no msigd error

      const value = await getSliderValue('red');
      expect(value).toBe(80);
    });

    it('should adjust green color slider', async () => {
      const input = await $('[data-testid="slider-input-green"]');
      if (!(await input.isExisting())) return;

      await setSliderValue('green', 60);
      await assertNoErrorToast(); // Verify no msigd error

      const value = await getSliderValue('green');
      expect(value).toBe(60);
    });

    it('should adjust blue color slider', async () => {
      const input = await $('[data-testid="slider-input-blue"]');
      if (!(await input.isExisting())) return;

      await setSliderValue('blue', 40);
      await assertNoErrorToast(); // Verify no msigd error

      const value = await getSliderValue('blue');
      expect(value).toBe(40);
    });

    it('should auto-switch to custom preset when RGB adjusted (if API succeeds)', async () => {
      const presetSelect = await $('[data-testid="select-input-color-preset"]');
      const redInput = await $('[data-testid="slider-input-red"]');
      if (!(await presetSelect.isExisting()) || !(await redInput.isExisting())) return;

      // First set to a non-custom preset
      await presetSelect.selectByAttribute('value', 'normal');
      await browser.pause(300);

      const presetBeforeAdjust = await presetSelect.getValue();
      expect(presetBeforeAdjust).toBe('normal');

      // Adjust RGB slider - this should trigger the preset to change to 'custom'
      await setSliderValue('red', 90);
      await browser.pause(500); // Wait for debounce and API call
      await assertNoErrorToast(); // Verify no msigd error

      // Check if preset changed to custom
      const currentPreset = await presetSelect.getValue();
      expect(currentPreset).toBe('custom');
    });
  });

  // ============================================================
  // LED View - Select, Color Picker, and Button Interactions
  // ============================================================
  describe('LED View - Select, Color Picker, and Button Interactions', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-led"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should change LED mode and update UI accordingly', async () => {
      const select = await $('[data-testid="select-input-led-mode"]');
      if (!(await select.isExisting())) return;

      // Test 'off' mode - no color picker
      await select.selectByAttribute('value', 'off');
      await browser.pause(300);
      let colorsSection = await $('[data-testid="led-colors"]');
      expect(await colorsSection.isExisting()).toBe(false);

      // Test 'static' mode - primary color picker visible
      await select.selectByAttribute('value', 'static');
      await browser.pause(300);
      const primaryColor = await $('[data-testid="led-color-primary"]');
      expect(await primaryColor.isExisting()).toBe(true);

      // Test 'rainbow' mode - no color picker needed
      await select.selectByAttribute('value', 'rainbow');
      await browser.pause(300);
      colorsSection = await $('[data-testid="led-colors"]');
      expect(await colorsSection.isExisting()).toBe(false);
    });

    it('should show secondary color picker for dual-color modes', async () => {
      const select = await $('[data-testid="select-input-led-mode"]');
      if (!(await select.isExisting())) return;

      // Test 'breathing' mode - should show both colors
      await select.selectByAttribute('value', 'breathing');
      await browser.pause(300);

      const primaryColor = await $('[data-testid="led-color-primary"]');
      const secondaryColor = await $('[data-testid="led-color-secondary"]');

      expect(await primaryColor.isExisting()).toBe(true);
      expect(await secondaryColor.isExisting()).toBe(true);
    });

    it('should change primary LED color', async () => {
      const select = await $('[data-testid="select-input-led-mode"]');
      if (!(await select.isExisting())) return;

      // Set to static mode to show color picker
      await select.selectByAttribute('value', 'static');
      await browser.pause(300);

      const colorInput = await $('[data-testid="led-color-primary"]');
      if (!(await colorInput.isExisting())) return;

      // Set color to blue using JavaScript
      await setColorValue('led-color-primary', '#0000ff');

      const value = await getColorValue('led-color-primary');
      expect(value.toLowerCase()).toBe('#0000ff');
    });

    it('should click Apply LED Settings button successfully', async () => {
      const button = await $('[data-testid="apply-led-button"]');
      if (!(await button.isExisting())) return;

      // Verify button is clickable
      expect(await button.isClickable()).toBe(true);

      // Click the button
      await button.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      // Button should still exist and be clickable after action
      expect(await button.isExisting()).toBe(true);
    });

    it('should configure and apply breathing mode with two colors', async () => {
      const select = await $('[data-testid="select-input-led-mode"]');
      if (!(await select.isExisting())) return;

      // Set breathing mode
      await select.selectByAttribute('value', 'breathing');
      await browser.pause(300);

      const primaryColor = await $('[data-testid="led-color-primary"]');
      const secondaryColor = await $('[data-testid="led-color-secondary"]');

      if (!(await primaryColor.isExisting()) || !(await secondaryColor.isExisting())) return;

      // Set colors using JavaScript
      await setColorValue('led-color-primary', '#ff0000');
      await setColorValue('led-color-secondary', '#0000ff');

      // Apply settings
      const button = await $('[data-testid="apply-led-button"]');
      await button.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      // Verify colors persisted
      const primary = await getColorValue('led-color-primary');
      const secondary = await getColorValue('led-color-secondary');
      expect(primary.toLowerCase()).toBe('#ff0000');
      expect(secondary.toLowerCase()).toBe('#0000ff');
    });
  });

  // ============================================================
  // Advanced View - Toggle and Select Interactions
  // ============================================================
  describe('Advanced View - Toggle and Select Interactions', () => {
    beforeEach(async () => {
      const tab = await $('[data-testid="tab-advanced"]');
      await tab.click();
      await browser.pause(500);
    });

    it('should change image enhancement selection', async () => {
      const select = await $('[data-testid="select-input-image-enhancement"]');
      if (!(await select.isExisting())) return;

      const options = ['off', 'weak', 'medium', 'strong', 'strongest'];
      for (const option of options) {
        await select.selectByAttribute('value', option);
        await browser.pause(300);
        await assertNoErrorToast(); // Verify no msigd error

        const selectedValue = await select.getValue();
        expect(selectedValue).toBe(option);
      }
    });

    it('should toggle HDCR on and off', async () => {
      const toggle = await $('[data-testid="toggle-hdcr-high-dynamic-contrast"]');
      if (!(await toggle.isExisting())) return;

      const getToggleState = async (): Promise<boolean> => {
        const ariaChecked = await toggle.getAttribute('aria-checked');
        return ariaChecked === 'true';
      };

      // Verify toggle is clickable
      expect(await toggle.isClickable()).toBe(true);

      const initialState = await getToggleState();

      // Toggle on
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterFirstClick = await getToggleState();
      expect(afterFirstClick).not.toBe(initialState);

      // Toggle off
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterSecondClick = await getToggleState();
      expect(afterSecondClick).toBe(initialState);
    });

    it('should toggle refresh rate display on and off', async () => {
      const toggle = await $('[data-testid="toggle-show-refresh-rate"]');
      if (!(await toggle.isExisting())) return;

      const getToggleState = async (): Promise<boolean> => {
        const ariaChecked = await toggle.getAttribute('aria-checked');
        return ariaChecked === 'true';
      };

      // Verify toggle is clickable
      expect(await toggle.isClickable()).toBe(true);

      const initialState = await getToggleState();

      // Toggle on
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterFirstClick = await getToggleState();
      expect(afterFirstClick).not.toBe(initialState);

      // Toggle off
      await toggle.click();
      await browser.pause(500);
      await assertNoErrorToast(); // Verify no msigd error

      const afterSecondClick = await getToggleState();
      expect(afterSecondClick).toBe(initialState);
    });

    it('should display monitor information correctly', async () => {
      const monitorInfo = await $('[data-testid="monitor-info"]');
      if (!(await monitorInfo.isExisting())) return;

      const model = await $('[data-testid="info-model"]');
      const serial = await $('[data-testid="info-serial"]');
      const firmware = await $('[data-testid="info-firmware"]');

      // Model should have some text
      if (await model.isExisting()) {
        const modelText = await model.getText();
        expect(modelText.length).toBeGreaterThan(0);
      }

      // Serial should have some text
      if (await serial.isExisting()) {
        const serialText = await serial.getText();
        expect(serialText.length).toBeGreaterThan(0);
      }

      // Firmware field should exist (may show "Unknown")
      if (await firmware.isExisting()) {
        const firmwareText = await firmware.getText();
        expect(firmwareText.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================
  // Cross-Component Tests
  // ============================================================
  describe('Cross-Component Tests', () => {
    it('should handle rapid slider adjustments without errors', async () => {
      const tab = await $('[data-testid="tab-display"]');
      await tab.click();
      await browser.pause(500);

      const input = await $('[data-testid="slider-input-brightness"]');
      if (!(await input.isExisting())) return;

      // Rapidly change values
      const values = [30, 50, 70, 90, 60];
      for (const value of values) {
        await setSliderValue('brightness', value);
        await browser.pause(50); // Short delay between changes
      }
      await browser.pause(500); // Wait for final debounce
      await assertNoErrorToast(); // Verify no msigd error after rapid changes

      // Final value should be the last one set
      const finalValue = await getSliderValue('brightness');
      expect(finalValue).toBe(60);
    });

    it('should preserve settings when switching between tabs', async () => {
      // Go to Display tab and set brightness
      const displayTab = await $('[data-testid="tab-display"]');
      await displayTab.click();
      await browser.pause(500);

      const brightnessInput = await $('[data-testid="slider-input-brightness"]');
      if (!(await brightnessInput.isExisting())) return;

      await setSliderValue('brightness', 55);
      await browser.pause(300);
      await assertNoErrorToast(); // Verify no msigd error

      // Switch to Color tab
      const colorTab = await $('[data-testid="tab-color"]');
      await colorTab.click();
      await browser.pause(500);

      // Switch back to Display tab
      await displayTab.click();
      await browser.pause(500);

      // Verify brightness value persisted
      const preservedValue = await getSliderValue('brightness');
      expect(preservedValue).toBe(55);
    });

    it('should maintain app stability after multiple interactions', async () => {
      // Perform various interactions across tabs
      const tabs = ['display', 'color', 'led', 'advanced'];

      for (const tabName of tabs) {
        const tab = await $(`[data-testid="tab-${tabName}"]`);
        await tab.click();
        await browser.pause(300);

        // Verify tab is active
        await expect(tab).toHaveElementClass('active');
      }

      // App should still be functional
      const app = await $('[data-testid="app"]');
      expect(await app.isExisting()).toBe(true);

      const header = await $('[data-testid="header"]');
      expect(await header.isExisting()).toBe(true);
    });
  });

  // ============================================================
  // Monitor Selector Interaction
  // ============================================================
  describe('Monitor Selector Interaction', () => {
    it('should have selectable options in monitor dropdown', async () => {
      const select = await $('[data-testid="monitor-select"]');
      await expect(select).toExist();

      const options = await select.$$('option');
      expect(options.length).toBeGreaterThanOrEqual(1);

      // If multiple monitors, test switching
      if (options.length > 1) {
        // Get second option value
        const secondOption = options[1];
        const value = await secondOption.getAttribute('value');

        // Select it
        await select.selectByAttribute('value', value);
        await browser.pause(500);
        await assertNoErrorToast(); // Verify no msigd error

        // Verify selection changed
        const selectedValue = await select.getValue();
        expect(selectedValue).toBe(value);
      }
    });
  });
});
