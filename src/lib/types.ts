// Type definitions for msigd-gui

export interface Monitor {
  id: string;
  serial: string;
  model: string;
  firmware: string;
}

export interface MonitorSettings {
  brightness: number;
  contrast: number;
  sharpness: number;
  responseTime: "normal" | "fast" | "fastest";
  eyeSaver: boolean;
  imageEnhancement: "off" | "weak" | "medium" | "strong" | "strongest";
  colorPreset: "cool" | "normal" | "warm" | "custom";
  colorRgb: { r: number; g: number; b: number };
  hdcr: boolean;
  refreshRateDisplay: boolean;
}

export interface MysticLightConfig {
  ledGroup: string;
  mode: MysticLightMode;
  colors: string[];
}

export type MysticLightMode =
  | "off"
  | "static"
  | "breathing"
  | "blinking"
  | "flashing"
  | "double_flashing"
  | "lightning"
  | "rainbow"
  | "meteor"
  | "rainbow_gradient";

export type Tab = "display" | "color" | "led" | "advanced";
