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
  // Phase 1: OSD settings
  osdTransparency: number;
  osdTimeout: number;
  // Phase 2: MAG Core settings
  nightVision: NightVision;
  blackTuner: number;
  screenAssistance: ScreenAssistance;
  refreshPosition: Position;
  alarmClock: AlarmClock;
  alarmPosition: Position;
  soundEnable: boolean;
  // Phase 3: Performance settings
  zeroLatency: boolean;
  freeSync: boolean;
  gameMode: GameMode;
  proMode: ProMode;
  // Phase 4: Input/System settings
  input: InputSource;
  autoScan: boolean;
  screenInfo: boolean;
  screenSize: ScreenSize;
  powerButton: PowerButton;
  hdmiCec: boolean;
  kvm: KvmMode;
  audioSource: AudioSource;
  rgbLed: boolean;
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

// Phase 2: MAG Core types
export type NightVision = "off" | "normal" | "strong" | "strongest" | "ai";
export type Position = "left_top" | "right_top" | "left_bottom" | "right_bottom";
export type ScreenAssistance =
  | "off"
  | "red1" | "red2" | "red3" | "red4" | "red5" | "red6"
  | "white1" | "white2" | "white3" | "white4" | "white5" | "white6";
export type AlarmClock = "off" | "1" | "2" | "3" | "4";

// Phase 3: Performance/Mode types
export type GameMode = "user" | "fps" | "racing" | "rts" | "rpg" | "premium_color";
export type ProMode =
  | "user" | "reader" | "cinema" | "designer" | "office" | "srgb"
  | "adobe_rgb" | "dci_p3" | "eco" | "anti_blue" | "movie";

// Phase 4: Input/System types
export type InputSource = "hdmi1" | "hdmi2" | "dp" | "usbc";
export type ScreenSize = "auto" | "4:3" | "16:9" | "21:9" | "1:1" | "19" | "24";
export type PowerButton = "off" | "standby";
export type KvmMode = "auto" | "upstream" | "type_c";
export type AudioSource = "analog" | "digital";

export type Tab = "display" | "color" | "performance" | "osd" | "input" | "led";
