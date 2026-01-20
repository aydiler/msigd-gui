// Tauri API bindings for monitor commands

import type { Monitor, MonitorSettings } from "../types";

// Use global Tauri API if available, fallback to import
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  // Try global API first (set by withGlobalTauri)
  const win = window as any;
  if (win.__TAURI__?.core?.invoke) {
    return win.__TAURI__.core.invoke(cmd, args);
  }
  if (win.__TAURI_INTERNALS__?.invoke) {
    return win.__TAURI_INTERNALS__.invoke(cmd, args);
  }
  // Fallback to npm package
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke(cmd, args);
}

/**
 * List all connected MSI monitors
 */
export async function listMonitors(): Promise<Monitor[]> {
  return invoke("list_monitors");
}

/**
 * Get settings for a specific monitor
 */
export async function getMonitorSettings(
  monitorId: string
): Promise<MonitorSettings> {
  return invoke("get_monitor_settings", { monitorId });
}

/**
 * Set brightness (0-100)
 */
export async function setBrightness(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_brightness", { monitorId, value });
}

/**
 * Set contrast (0-100)
 */
export async function setContrast(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_contrast", { monitorId, value });
}

/**
 * Set sharpness (0-5)
 */
export async function setSharpness(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_sharpness", { monitorId, value });
}

/**
 * Set response time
 */
export async function setResponseTime(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_response_time", { monitorId, value });
}

/**
 * Set eye saver mode
 */
export async function setEyeSaver(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_eye_saver", { monitorId, enabled });
}

/**
 * Check if msigd is available
 */
export async function checkMsigdAvailable(): Promise<boolean> {
  return invoke("check_msigd_available");
}
