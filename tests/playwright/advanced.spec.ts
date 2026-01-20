import { test, expect } from './fixtures';

test.describe('MSI Monitor Control - Advanced View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load, then navigate to Advanced tab
    await page.waitForSelector('.tab');
    await page.locator('.tab', { hasText: 'Advanced' }).click();
    await page.waitForTimeout(300);
  });

  test.describe('Image Enhancement', () => {
    test('should have Image Enhancement selector', async ({ page }) => {
      const enhancementLabel = page.locator('text=Image Enhancement');
      await expect(enhancementLabel).toBeVisible();
    });

    test('should have all enhancement options', async ({ page }) => {
      // Select within the advanced-view, not the header
      const select = page.locator('.advanced-view select');

      // Verify options exist by checking the select's inner HTML
      const innerHTML = await select.innerHTML();
      expect(innerHTML).toContain('Off');
      expect(innerHTML).toContain('Weak');
      expect(innerHTML).toContain('Medium');
      expect(innerHTML).toContain('Strong');
      expect(innerHTML).toContain('Strongest');
    });

    test('should change enhancement when option is selected', async ({ page }) => {
      // Select within the advanced-view
      const select = page.locator('.advanced-view select');
      await select.selectOption('medium');
      await expect(select).toHaveValue('medium');
    });
  });

  test.describe('HDCR Toggle', () => {
    test('should have HDCR toggle', async ({ page }) => {
      const hdcrLabel = page.locator('text=HDCR');
      await expect(hdcrLabel).toBeVisible();
    });

    test('should toggle HDCR when clicked', async ({ page }) => {
      const toggles = page.locator('button[role="switch"]');
      const hdcrToggle = toggles.first();

      const initialState = await hdcrToggle.getAttribute('aria-checked');
      await hdcrToggle.click();
      await page.waitForTimeout(100);

      const newState = await hdcrToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });
  });

  test.describe('Refresh Rate Display Toggle', () => {
    test('should have Show Refresh Rate toggle', async ({ page }) => {
      const refreshLabel = page.locator('text=Show Refresh Rate');
      await expect(refreshLabel).toBeVisible();
    });

    test('should toggle refresh rate display when clicked', async ({ page }) => {
      const toggles = page.locator('button[role="switch"]');
      const refreshToggle = toggles.nth(1); // Second toggle

      const initialState = await refreshToggle.getAttribute('aria-checked');
      await refreshToggle.click();
      await page.waitForTimeout(100);

      const newState = await refreshToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });
  });

  test.describe('Monitor Information', () => {
    test('should display Monitor Info section', async ({ page }) => {
      const infoHeader = page.locator('h3', { hasText: /MONITOR INFO/i });
      await expect(infoHeader).toBeVisible();
    });

    test('should show Model field', async ({ page }) => {
      const modelLabel = page.locator('text=Model');
      await expect(modelLabel).toBeVisible();
    });

    test('should show Serial field', async ({ page }) => {
      const serialLabel = page.locator('text=Serial');
      await expect(serialLabel).toBeVisible();
    });

    test('should show Firmware field', async ({ page }) => {
      const firmwareLabel = page.locator('text=Firmware');
      await expect(firmwareLabel).toBeVisible();
    });

    test('should display mock monitor model', async ({ page }) => {
      // The mock returns 'MAG274QRF-QD' as model
      // Use the info-value class to be more specific
      const modelValue = page.locator('.info-value', { hasText: 'MAG274QRF-QD' });
      await expect(modelValue).toBeVisible();
    });
  });
});
