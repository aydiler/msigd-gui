// Tauri API bindings for monitor commands

import type { Monitor, MonitorSettings, MysticLightMode } from "../types";

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
 * Note: LED settings are not queryable from hardware, so defaults are added
 */
export async function getMonitorSettings(
  monitorId: string
): Promise<MonitorSettings> {
  const settings = await invoke<Omit<MonitorSettings, "ledMode" | "ledColor" | "ledColor2">>(
    "get_monitor_settings",
    { monitorId }
  );
  // Add default LED values (not queryable from hardware)
  return {
    ...settings,
    ledMode: "off",
    ledColor: "#ff0000",
    ledColor2: "#0000ff",
  };
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

/**
 * Set color preset (cool, normal, warm, custom)
 */
export async function setColorPreset(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_color_preset", { monitorId, value });
}

/**
 * Set color RGB values (0-100 each)
 */
export async function setColorRgb(
  monitorId: string,
  r: number,
  g: number,
  b: number
): Promise<void> {
  return invoke("set_color_rgb", { monitorId, r, g, b });
}

/**
 * Set image enhancement mode
 */
export async function setImageEnhancement(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_image_enhancement", { monitorId, value });
}

/**
 * Set HDCR (High Dynamic Contrast Ratio)
 */
export async function setHdcr(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_hdcr", { monitorId, enabled });
}

/**
 * Set refresh rate display
 */
export async function setRefreshRateDisplay(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_refresh_rate_display", { monitorId, enabled });
}

/**
 * Set Mystic Light LED configuration
 */
export async function setMysticLight(
  monitorId: string,
  config: string
): Promise<void> {
  return invoke("set_mystic_light", { monitorId, config });
}
