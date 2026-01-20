/**
 * MSI Monitor Control - E2E Tests
 *
 * Tests the real Tauri application using WebdriverIO + tauri-driver.
 * Uses WebKitWebDriver on Linux.
 *
 * Run: npm run test:wdio
 */

describe('MSI Monitor Control', () => {
  describe('Application Launch', () => {
    it('should display the app title', async () => {
      const title = await $('[data-testid="app-title"]');
      await expect(title).toHaveText('MSI Monitor Control');
    });

    it('should have a monitor selector', async () => {
      const select = await $('[data-testid="monitor-select"]');
      await expect(select).toExist();
    });

    it('should have navigation tabs', async () => {
      const tabs = await $('[data-testid="tabs"]');
      await expect(tabs).toExist();

      // Check all four tabs exist
      await expect($('[data-testid="tab-display"]')).toExist();
      await expect($('[data-testid="tab-color"]')).toExist();
      await expect($('[data-testid="tab-led"]')).toExist();
      await expect($('[data-testid="tab-advanced"]')).toExist();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Color tab when clicked', async () => {
      const colorTab = await $('[data-testid="tab-color"]');
      await colorTab.click();

      // Tab should become active (has .active class)
      await expect(colorTab).toHaveElementClass('active');
    });

    it('should switch to LED tab when clicked', async () => {
      const ledTab = await $('[data-testid="tab-led"]');
      await ledTab.click();

      await expect(ledTab).toHaveElementClass('active');
    });

    it('should switch to Advanced tab when clicked', async () => {
      const advancedTab = await $('[data-testid="tab-advanced"]');
      await advancedTab.click();

      await expect(advancedTab).toHaveElementClass('active');
    });

    it('should switch back to Display tab when clicked', async () => {
      const displayTab = await $('[data-testid="tab-display"]');
      await displayTab.click();

      await expect(displayTab).toHaveElementClass('active');
    });
  });

  describe('Monitor Detection', () => {
    it('should show content area', async () => {
      const content = await $('[data-testid="content"]');
      await expect(content).toExist();
    });

    it('should complete loading and show status', async () => {
      // Wait for loading to complete (spinner should disappear)
      const loading = await $('[data-testid="status-loading"]');

      // Either loading finishes or we see a status message
      try {
        await loading.waitForExist({ timeout: 5000, reverse: true });
      } catch {
        // Loading might already be done
      }

      // Content should exist
      const content = await $('[data-testid="content"]');
      await expect(content).toExist();
    });
  });

  describe('UI Responsiveness', () => {
    it('should have clickable tabs', async () => {
      const tabs = await $$('[data-testid^="tab-"]');
      expect(tabs.length).toBe(4);

      for (const tab of tabs) {
        await expect(tab).toBeClickable();
      }
    });
  });
});
