import { test, expect } from './fixtures';

test.describe('MSI Monitor Control - Display View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app and settings to load
    await page.waitForSelector('.display-view', { timeout: 10000 });
  });

  test.describe('Picture Settings', () => {
    test('should display Picture settings group', async ({ page }) => {
      const header = page.locator('h3', { hasText: /PICTURE/i });
      await expect(header).toBeVisible();
    });

    test('should have Brightness slider', async ({ page }) => {
      const brightnessLabel = page.locator('text=Brightness');
      await expect(brightnessLabel).toBeVisible();

      // Find the slider in the same container
      const slider = page.locator('input[type="range"]').first();
      await expect(slider).toBeVisible();
      await expect(slider).toHaveAttribute('min', '0');
      await expect(slider).toHaveAttribute('max', '100');
    });

    test('should have Contrast slider', async ({ page }) => {
      const contrastLabel = page.locator('text=Contrast');
      await expect(contrastLabel).toBeVisible();
    });

    test('should have Sharpness slider', async ({ page }) => {
      const sharpnessLabel = page.locator('text=Sharpness');
      await expect(sharpnessLabel).toBeVisible();
    });

    test('should update brightness value when slider is moved', async ({ page }) => {
      // Get the brightness slider (first range input)
      const slider = page.locator('input[type="range"]').first();

      // Change the value
      await slider.fill('75');

      // Wait for debounce and check the displayed value
      await page.waitForTimeout(200);
      const valueDisplay = page.locator('text=75%').first();
      await expect(valueDisplay).toBeVisible();
    });
  });

  test.describe('Performance Settings', () => {
    test('should display Performance settings group', async ({ page }) => {
      const header = page.locator('h3', { hasText: /PERFORMANCE/i });
      await expect(header).toBeVisible();
    });

    test('should have Response Time selector', async ({ page }) => {
      const responseTimeLabel = page.locator('text=Response Time');
      await expect(responseTimeLabel).toBeVisible();

      // Select within the display-view, not the header
      const select = page.locator('.display-view select');
      await expect(select).toBeVisible();
    });

    test('should have all response time options', async ({ page }) => {
      // Select within the display-view
      const select = page.locator('.display-view select');

      // Verify options exist by checking the select's inner HTML
      const innerHTML = await select.innerHTML();
      expect(innerHTML).toContain('Normal');
      expect(innerHTML).toContain('Fast');
      expect(innerHTML).toContain('Fastest');
    });

    test('should change response time when option is selected', async ({ page }) => {
      // Select within the display-view
      const select = page.locator('.display-view select');
      await select.selectOption('fastest');

      await expect(select).toHaveValue('fastest');
    });
  });

  test.describe('Comfort Settings', () => {
    test('should display Comfort settings group', async ({ page }) => {
      const header = page.locator('h3', { hasText: /COMFORT/i });
      await expect(header).toBeVisible();
    });

    test('should have Eye Saver Mode toggle', async ({ page }) => {
      const eyeSaverLabel = page.locator('text=Eye Saver Mode');
      await expect(eyeSaverLabel).toBeVisible();

      const toggle = page.locator('button[role="switch"]').first();
      await expect(toggle).toBeVisible();
    });

    test('should toggle Eye Saver Mode when clicked', async ({ page }) => {
      const toggle = page.locator('button[role="switch"]').first();

      // Get initial state
      const initialState = await toggle.getAttribute('aria-checked');

      // Click to toggle
      await toggle.click();
      await page.waitForTimeout(100);

      // Check state changed
      const newState = await toggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });
  });
});
