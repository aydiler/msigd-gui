// Svelte 5 reactive state for monitors

import type { Monitor, MonitorSettings } from "../types";
import { listMonitors, getMonitorSettings } from "../api/monitor";
import {
  loadPersistedState,
  savePersistedState,
  updateSettingsCache,
  getCachedSettings,
  clearMonitorCache,
} from "../api/store";

/**
 * Monitor state using Svelte 5 $state rune
 */
class MonitorState {
  monitors = $state<Monitor[]>([]);
  selectedId = $state<string | null>(null);
  settings = $state<MonitorSettings | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);
  isFromCache = $state(false);

  // Request ID for race condition protection
  private loadRequestId = 0;

  // Derived state
  get selectedMonitor(): Monitor | undefined {
    return this.monitors.find((m) => m.id === this.selectedId);
  }

  /**
   * Initialize state from persisted storage
   */
  async initialize(): Promise<void> {
    try {
      const persisted = await loadPersistedState();

      // Apply cached selected monitor ID
      if (persisted.selectedMonitorId) {
        this.selectedId = persisted.selectedMonitorId;

        // Load cached settings for instant UI
        const cachedSettings = await getCachedSettings(persisted.selectedMonitorId);
        if (cachedSettings) {
          this.settings = cachedSettings;
          this.isFromCache = true;
        }
      }
    } catch (e) {
      console.error("Failed to initialize from persisted state:", e);
    }
  }

  async loadMonitors() {
    this.loading = true;
    this.error = null;

    try {
      this.monitors = await listMonitors();

      if (this.monitors.length > 0) {
        // Check if persisted monitor still exists
        const persistedMonitorExists = this.selectedId
          ? this.monitors.some((m) => m.id === this.selectedId)
          : false;

        if (persistedMonitorExists && this.selectedId) {
          // If we already have cached settings (from initialize), keep them
          // Only query hardware if no cached settings exist
          if (!this.settings) {
            const cached = await getCachedSettings(this.selectedId);
            if (cached) {
              this.settings = cached;
              this.isFromCache = true;
            } else {
              await this.loadSettings(this.selectedId);
            }
          }
        } else {
          // Fallback to first monitor if persisted one doesn't exist
          if (this.selectedId && !persistedMonitorExists) {
            // Clear stale cache for disconnected monitor
            await clearMonitorCache(this.selectedId);
          }
          await this.selectMonitor(this.monitors[0].id);
        }
      } else {
        this.settings = null;
        this.isFromCache = false;
      }
    } catch (e) {
      this.error = String(e);
      console.error("Failed to load monitors:", e);
    } finally {
      this.loading = false;
    }
  }

  async selectMonitor(id: string) {
    this.selectedId = id;

    // Persist selection immediately
    await savePersistedState({ selectedMonitorId: id });

    // Try to load from cache first
    const cached = await getCachedSettings(id);
    if (cached) {
      // Use cache as source of truth - don't query hardware
      this.settings = cached;
      this.isFromCache = true;
      this.loading = false;
    } else {
      // No cache - must query hardware
      await this.loadSettings(id);
    }
  }

  /**
   * Load settings from hardware (only used when no cache exists)
   */
  async loadSettings(monitorId: string) {
    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.error = null;

    try {
      const settings = await getMonitorSettings(monitorId);

      // Ignore stale requests (user switched monitors while loading)
      if (requestId !== this.loadRequestId) return;

      this.settings = settings;
      this.isFromCache = false;

      // Save to cache
      await updateSettingsCache(monitorId, settings);
    } catch (e) {
      if (requestId === this.loadRequestId) {
        this.error = String(e);
        console.error("Failed to load settings:", e);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading = false;
      }
    }
  }

  /**
   * Force refresh settings from hardware, preserving LED settings from cache
   */
  async refreshFromHardware() {
    if (!this.selectedId) return;

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.error = null;

    // Remember current LED settings (hardware can't provide them)
    const cachedLedMode = this.settings?.ledMode ?? "off";
    const cachedLedColor = this.settings?.ledColor ?? "#ff0000";
    const cachedLedColor2 = this.settings?.ledColor2 ?? "#0000ff";

    try {
      const settings = await getMonitorSettings(this.selectedId);

      // Ignore stale requests
      if (requestId !== this.loadRequestId) return;

      // Preserve LED settings from cache
      settings.ledMode = cachedLedMode;
      settings.ledColor = cachedLedColor;
      settings.ledColor2 = cachedLedColor2;

      this.settings = settings;
      this.isFromCache = false;

      // Update cache with fresh hardware values + preserved LED
      await updateSettingsCache(this.selectedId, settings);
    } catch (e) {
      if (requestId === this.loadRequestId) {
        this.error = String(e);
        console.error("Failed to refresh settings:", e);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading = false;
      }
    }
  }

  async updateSetting<K extends keyof MonitorSettings>(
    key: K,
    value: MonitorSettings[K]
  ): Promise<void> {
    if (this.settings && this.selectedId) {
      this.settings = { ...this.settings, [key]: value };

      // Await cache write to ensure persistence
      await updateSettingsCache(this.selectedId, this.settings);
    }
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instance
export const monitorState = new MonitorState();
