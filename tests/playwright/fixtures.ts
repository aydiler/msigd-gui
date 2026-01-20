import { test as base, expect } from '@playwright/test';

// Mock data for testing
export const mockMonitor = {
  id: 'test-monitor-001',
  serial: 'SN123456789',
  model: 'MAG274QRF-QD',
  firmware: '1.0.5',
};

export const mockSettings = {
  brightness: 50,
  contrast: 50,
  sharpness: 2,
  responseTime: 'fast' as const,
  eyeSaver: false,
  colorPreset: 'normal' as const,
  colorRgb: { r: 50, g: 50, b: 50 },
  imageEnhancement: 'off' as const,
  hdcr: false,
  refreshRateDisplay: false,
};

// Extended test fixture that mocks Tauri API
export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject Tauri mock before page loads
    await page.addInitScript(() => {
      // Mock Tauri API
      (window as any).__TAURI__ = {
        core: {
          invoke: async (cmd: string, args?: any) => {
            console.log('[Mock Tauri] invoke:', cmd, args);

            switch (cmd) {
              case 'list_monitors':
                return [{
                  id: 'test-monitor-001',
                  serial: 'SN123456789',
                  model: 'MAG274QRF-QD',
                  firmware: '1.0.5',
                }];

              case 'get_monitor_settings':
                return {
                  brightness: 50,
                  contrast: 50,
                  sharpness: 2,
                  responseTime: 'fast',
                  eyeSaver: false,
                  colorPreset: 'normal',
                  colorRgb: { r: 50, g: 50, b: 50 },
                  imageEnhancement: 'off',
                  hdcr: false,
                  refreshRateDisplay: false,
                };

              case 'set_brightness':
              case 'set_contrast':
              case 'set_sharpness':
              case 'set_response_time':
              case 'set_eye_saver':
              case 'set_color_preset':
              case 'set_color_rgb':
              case 'set_image_enhancement':
              case 'set_hdcr':
              case 'set_refresh_rate_display':
              case 'set_mystic_light':
                // Simulate successful command
                return null;

              default:
                console.warn('[Mock Tauri] Unknown command:', cmd);
                return null;
            }
          },
        },
      };

      // Also set up the invoke function at window level for Tauri 2.0
      (window as any).__TAURI_INTERNALS__ = {
        invoke: (window as any).__TAURI__.core.invoke,
      };
    });

    await use(page);
  },
});

export { expect };
