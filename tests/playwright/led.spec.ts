import { test, expect } from './fixtures';

test.describe('MSI Monitor Control - LED View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load, then navigate to LED tab
    await page.waitForSelector('.tab');
    await page.locator('.tab', { hasText: 'LED' }).click();
    await page.waitForTimeout(300);
  });

  test.describe('LED Mode Selection', () => {
    test('should have LED Mode selector', async ({ page }) => {
      const modeLabel = page.locator('text=LED Mode');
      await expect(modeLabel).toBeVisible();
    });

    test('should have multiple LED mode options', async ({ page }) => {
      // Select within the led-view, not the header
      const select = page.locator('.led-view select');

      // Verify options exist by checking the select's inner HTML
      const innerHTML = await select.innerHTML();
      expect(innerHTML).toContain('Off');
      expect(innerHTML).toContain('Static');
      expect(innerHTML).toContain('Breathing');
      expect(innerHTML).toContain('Rainbow');
    });

    test('should change LED mode when option is selected', async ({ page }) => {
      // Select within the led-view
      const select = page.locator('.led-view select');
      await select.selectOption('static');
      await expect(select).toHaveValue('static');
    });
  });

  test.describe('Color Pickers', () => {
    test('should show color picker when Static mode is selected', async ({ page }) => {
      // Select within the led-view
      const select = page.locator('.led-view select');
      await select.selectOption('static');
      await page.waitForTimeout(200);

      // Look for color input
      const colorInput = page.locator('input[type="color"]');
      await expect(colorInput.first()).toBeVisible();
    });
  });

  test.describe('Apply Button', () => {
    test('should have Apply LED Settings button', async ({ page }) => {
      const applyButton = page.locator('button', { hasText: 'Apply LED Settings' });
      await expect(applyButton).toBeVisible();
    });

    test('should be clickable', async ({ page }) => {
      const applyButton = page.locator('button', { hasText: 'Apply LED Settings' });
      await expect(applyButton).toBeEnabled();
    });
  });
});
