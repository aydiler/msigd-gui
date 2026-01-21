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

// Phase 1: OSD Settings

/**
 * Set OSD transparency (0-5)
 */
export async function setOsdTransparency(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_osd_transparency", { monitorId, value });
}

/**
 * Set OSD timeout (0-30 seconds)
 */
export async function setOsdTimeout(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_osd_timeout", { monitorId, value });
}

// Phase 2: MAG Core Settings

/**
 * Set night vision mode
 */
export async function setNightVision(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_night_vision", { monitorId, value });
}

/**
 * Set black tuner (0-20)
 */
export async function setBlackTuner(
  monitorId: string,
  value: number
): Promise<void> {
  return invoke("set_black_tuner", { monitorId, value });
}

/**
 * Set screen assistance (crosshair)
 */
export async function setScreenAssistance(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_screen_assistance", { monitorId, value });
}

/**
 * Set refresh rate display position
 */
export async function setRefreshPosition(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_refresh_position", { monitorId, value });
}

/**
 * Set alarm clock timer
 */
export async function setAlarmClock(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_alarm_clock", { monitorId, value });
}

/**
 * Set alarm clock position
 */
export async function setAlarmPosition(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_alarm_position", { monitorId, value });
}

/**
 * Set sound enable
 */
export async function setSoundEnable(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_sound_enable", { monitorId, enabled });
}

// Phase 3: Performance Settings

/**
 * Set zero latency mode
 */
export async function setZeroLatency(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_zero_latency", { monitorId, enabled });
}

/**
 * Set FreeSync
 */
export async function setFreeSync(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_free_sync", { monitorId, enabled });
}

/**
 * Set game mode
 */
export async function setGameMode(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_game_mode", { monitorId, value });
}

/**
 * Set pro mode
 */
export async function setProMode(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_pro_mode", { monitorId, value });
}

// Phase 4: Input/System Settings

/**
 * Set input source
 */
export async function setInput(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_input", { monitorId, value });
}

/**
 * Set auto scan
 */
export async function setAutoScan(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_auto_scan", { monitorId, enabled });
}

/**
 * Set screen info display
 */
export async function setScreenInfo(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_screen_info", { monitorId, enabled });
}

/**
 * Set screen size
 */
export async function setScreenSize(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_screen_size", { monitorId, value });
}

/**
 * Set power button behavior
 */
export async function setPowerButton(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_power_button", { monitorId, value });
}

/**
 * Set HDMI CEC
 */
export async function setHdmiCec(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_hdmi_cec", { monitorId, enabled });
}

/**
 * Set KVM mode
 */
export async function setKvm(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_kvm", { monitorId, value });
}

/**
 * Set audio source
 */
export async function setAudioSource(
  monitorId: string,
  value: string
): Promise<void> {
  return invoke("set_audio_source", { monitorId, value });
}

/**
 * Set RGB LED
 */
export async function setRgbLed(
  monitorId: string,
  enabled: boolean
): Promise<void> {
  return invoke("set_rgb_led", { monitorId, enabled });
}
