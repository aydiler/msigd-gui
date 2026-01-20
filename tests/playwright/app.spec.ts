import { test, expect } from './fixtures';

test.describe('MSI Monitor Control - Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load and mock data to populate
    await page.waitForSelector('h1');
  });

  test.describe('Initial Load', () => {
    test('should display the application title', async ({ page }) => {
      const title = page.locator('h1');
      await expect(title).toHaveText('MSI Monitor Control');
    });

    test('should have monitor selector in header', async ({ page }) => {
      const selector = page.locator('.monitor-select');
      await expect(selector).toBeVisible();
    });

    test('should display all four navigation tabs', async ({ page }) => {
      const tabs = page.locator('.tab');
      await expect(tabs).toHaveCount(4);

      await expect(page.locator('.tab', { hasText: 'Display' })).toBeVisible();
      await expect(page.locator('.tab', { hasText: 'Color' })).toBeVisible();
      await expect(page.locator('.tab', { hasText: 'LED' })).toBeVisible();
      await expect(page.locator('.tab', { hasText: 'Advanced' })).toBeVisible();
    });

    test('should have Display tab active by default', async ({ page }) => {
      const displayTab = page.locator('.tab', { hasText: 'Display' });
      await expect(displayTab).toHaveClass(/active/);
    });

    test('should show mock monitor in selector', async ({ page }) => {
      // Wait for monitors to load
      await page.waitForTimeout(500);
      const selector = page.locator('.monitor-select');
      await expect(selector).toContainText('MAG274QRF-QD');
    });
  });

  test.describe('Tab Navigation', () => {
    test('should switch to Color tab when clicked', async ({ page }) => {
      const colorTab = page.locator('.tab', { hasText: 'Color' });
      await colorTab.click();
      await expect(colorTab).toHaveClass(/active/);
    });

    test('should switch to LED tab when clicked', async ({ page }) => {
      const ledTab = page.locator('.tab', { hasText: 'LED' });
      await ledTab.click();
      await expect(ledTab).toHaveClass(/active/);
    });

    test('should switch to Advanced tab when clicked', async ({ page }) => {
      const advancedTab = page.locator('.tab', { hasText: 'Advanced' });
      await advancedTab.click();
      await expect(advancedTab).toHaveClass(/active/);
    });

    test('should switch back to Display tab when clicked', async ({ page }) => {
      // First go to another tab
      await page.locator('.tab', { hasText: 'Color' }).click();

      // Then back to Display
      const displayTab = page.locator('.tab', { hasText: 'Display' });
      await displayTab.click();
      await expect(displayTab).toHaveClass(/active/);
    });
  });
});
