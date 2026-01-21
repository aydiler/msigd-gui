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
  // LED settings (frontend-only, not queryable from hardware)
  ledMode: MysticLightMode;
  ledColor: string;  // hex #RRGGBB
  ledColor2: string; // hex #RRGGBB
}

export interface MysticLightConfig {
  ledGroup: string;
  mode: MysticLightMode;
  colors: string[];
}

// msigd supported modes: off, static, breathing, blinking, flashing, blinds, meteor, rainbow, random
export type MysticLightMode =
  | "off"
  | "static"
  | "breathing"
  | "blinking"
  | "flashing"
  | "blinds"
  | "meteor"
  | "rainbow"
  | "random";

export type Tab = "display" | "color" | "led" | "advanced";
