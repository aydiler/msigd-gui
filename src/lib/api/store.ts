// Tauri Store API for persistent settings

import { load, type Store } from "@tauri-apps/plugin-store";
import type { Tab, MonitorSettings } from "../types";

const STORE_FILE = "settings.json";
const STORE_VERSION = 1;

interface CachedSettings {
  settings: MonitorSettings;
  cachedAt: number;
}

export interface PersistedState {
  version: number;
  selectedMonitorId: string | null;
  activeTab: Tab;
  settingsCache: Record<string, CachedSettings>;
}

const DEFAULT_STATE: PersistedState = {
  version: STORE_VERSION,
  selectedMonitorId: null,
  activeTab: "display",
  settingsCache: {},
};

let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, {
      defaults: {},  // Empty defaults - we handle missing keys in loadPersistedState
      autoSave: false, // Disable auto-save, we'll save explicitly
    });
  }
  return storeInstance;
}

/**
 * Load persisted state from the store
 */
export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const store = await getStore();

    const version = await store.get<number>("version");
    const selectedMonitorId = await store.get<string | null>("selectedMonitorId");
    const activeTab = await store.get<Tab>("activeTab");
    const settingsCache = await store.get<Record<string, CachedSettings>>("settingsCache");

    // Return defaults if no version (first run or corrupted)
    if (version === undefined || version === null) {
      return DEFAULT_STATE;
    }

    return {
      version: version ?? STORE_VERSION,
      selectedMonitorId: selectedMonitorId ?? null,
      activeTab: activeTab ?? "display",
      settingsCache: settingsCache ?? {},
    };
  } catch (error) {
    console.error("Failed to load persisted state:", error);
    return DEFAULT_STATE;
  }
}

/**
 * Save partial state to the store
 */
export async function savePersistedState(
  partial: Partial<Omit<PersistedState, "version">>
): Promise<void> {
  try {
    const store = await getStore();

    // Always ensure version is set
    await store.set("version", STORE_VERSION);

    if (partial.selectedMonitorId !== undefined) {
      await store.set("selectedMonitorId", partial.selectedMonitorId);
    }
    if (partial.activeTab !== undefined) {
      await store.set("activeTab", partial.activeTab);
    }
    if (partial.settingsCache !== undefined) {
      await store.set("settingsCache", partial.settingsCache);
    }

    // Explicitly save to disk
    await store.save();
  } catch (error) {
    console.error("Failed to save persisted state:", error);
  }
}

/**
 * Update settings cache for a specific monitor
 */
export async function updateSettingsCache(
  monitorId: string,
  settings: MonitorSettings
): Promise<void> {
  try {
    const store = await getStore();
    const currentCache = (await store.get<Record<string, CachedSettings>>("settingsCache")) ?? {};

    currentCache[monitorId] = {
      settings,
      cachedAt: Date.now(),
    };

    await store.set("settingsCache", currentCache);
    await store.save();
  } catch (error) {
    console.error("Failed to update settings cache:", error);
  }
}

/**
 * Clear cached settings for a specific monitor
 */
export async function clearMonitorCache(monitorId: string): Promise<void> {
  try {
    const store = await getStore();
    const currentCache = (await store.get<Record<string, CachedSettings>>("settingsCache")) ?? {};

    delete currentCache[monitorId];

    await store.set("settingsCache", currentCache);
    await store.save();
  } catch (error) {
    console.error("Failed to clear monitor cache:", error);
  }
}

/**
 * Get cached settings for a monitor if available
 */
export async function getCachedSettings(
  monitorId: string
): Promise<MonitorSettings | null> {
  try {
    const store = await getStore();
    const cache = (await store.get<Record<string, CachedSettings>>("settingsCache")) ?? {};

    const cached = cache[monitorId];
    if (cached) {
      return cached.settings;
    }
    return null;
  } catch (error) {
    console.error("Failed to get cached settings:", error);
    return null;
  }
}
