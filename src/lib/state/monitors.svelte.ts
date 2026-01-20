// Svelte 5 reactive state for monitors

import type { Monitor, MonitorSettings } from "../types";
import { listMonitors, getMonitorSettings } from "../api/monitor";

/**
 * Monitor state using Svelte 5 $state rune
 */
class MonitorState {
  monitors = $state<Monitor[]>([]);
  selectedId = $state<string | null>(null);
  settings = $state<MonitorSettings | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived state
  get selectedMonitor(): Monitor | undefined {
    return this.monitors.find((m) => m.id === this.selectedId);
  }

  async loadMonitors() {
    this.loading = true;
    this.error = null;

    try {
      this.monitors = await listMonitors();

      // Auto-select first monitor if none selected
      if (this.monitors.length > 0 && !this.selectedId) {
        await this.selectMonitor(this.monitors[0].id);
      } else if (this.monitors.length === 0) {
        this.settings = null;
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
    await this.loadSettings(id);
  }

  async loadSettings(monitorId: string) {
    this.loading = true;
    this.error = null;

    try {
      this.settings = await getMonitorSettings(monitorId);
    } catch (e) {
      this.error = String(e);
      console.error("Failed to load settings:", e);
    } finally {
      this.loading = false;
    }
  }

  updateSetting<K extends keyof MonitorSettings>(
    key: K,
    value: MonitorSettings[K]
  ) {
    if (this.settings) {
      this.settings = { ...this.settings, [key]: value };
    }
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instance
export const monitorState = new MonitorState();
