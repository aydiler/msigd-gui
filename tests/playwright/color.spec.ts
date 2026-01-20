import { test, expect } from './fixtures';

test.describe('MSI Monitor Control - Color View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load, then navigate to Color tab
    await page.waitForSelector('.tab');
    await page.locator('.tab', { hasText: 'Color' }).click();
    await page.waitForTimeout(300);
  });

  test.describe('Color Preset Selection', () => {
    test('should have Color Preset selector', async ({ page }) => {
      const presetLabel = page.locator('text=Color Preset');
      await expect(presetLabel).toBeVisible();
    });

    test('should have all preset options available', async ({ page }) => {
      // Select within the color-view, not the header
      const select = page.locator('.color-view select');

      // Verify options exist by checking the select's inner HTML
      const innerHTML = await select.innerHTML();
      expect(innerHTML).toContain('Cool');
      expect(innerHTML).toContain('Normal');
      expect(innerHTML).toContain('Warm');
      expect(innerHTML).toContain('Custom');
    });

    test('should change preset when option is selected', async ({ page }) => {
      // Select within the color-view
      const select = page.locator('.color-view select');
      await select.selectOption('warm');
      await expect(select).toHaveValue('warm');
    });
  });

  test.describe('RGB Sliders', () => {
    test('should have Red slider', async ({ page }) => {
      const redLabel = page.locator('text=Red');
      await expect(redLabel).toBeVisible();
    });

    test('should have Green slider', async ({ page }) => {
      const greenLabel = page.locator('text=Green');
      await expect(greenLabel).toBeVisible();
    });

    test('should have Blue slider', async ({ page }) => {
      const blueLabel = page.locator('text=Blue');
      await expect(blueLabel).toBeVisible();
    });

    test('should update Red value when slider is moved', async ({ page }) => {
      // Red slider is typically the second range input (after any preset-related ones)
      const sliders = page.locator('input[type="range"]');
      const redSlider = sliders.nth(0); // First slider in Color view

      await redSlider.fill('80');
      await page.waitForTimeout(200);

      // Verify value changed
      const value = await redSlider.inputValue();
      expect(value).toBe('80');
    });
  });
});
