//! Data types for msigd CLI output

use serde::{Deserialize, Serialize};

/// Represents a connected MSI monitor
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Monitor {
    pub id: String,
    pub serial: String,
    pub model: String,
    pub firmware: String,
}

// Original enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ResponseTime {
    Normal,
    Fast,
    Fastest,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ImageEnhancement {
    Off,
    Weak,
    Medium,
    Strong,
    Strongest,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ColorPreset {
    Cool,
    Normal,
    Warm,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColorRgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

// Phase 2: MAG Core enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum NightVision {
    #[default]
    Off,
    Normal,
    Strong,
    Strongest,
    Ai,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "snake_case")]
pub enum Position {
    #[default]
    #[serde(rename = "left_top")]
    LeftTop,
    #[serde(rename = "right_top")]
    RightTop,
    #[serde(rename = "left_bottom")]
    LeftBottom,
    #[serde(rename = "right_bottom")]
    RightBottom,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum ScreenAssistance {
    #[default]
    Off,
    Red1,
    Red2,
    Red3,
    Red4,
    Red5,
    Red6,
    White1,
    White2,
    White3,
    White4,
    White5,
    White6,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum AlarmClock {
    #[default]
    Off,
    #[serde(rename = "1")]
    One,
    #[serde(rename = "2")]
    Two,
    #[serde(rename = "3")]
    Three,
    #[serde(rename = "4")]
    Four,
}

// Phase 3: Performance/Mode enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "snake_case")]
pub enum GameMode {
    #[default]
    User,
    Fps,
    Racing,
    Rts,
    Rpg,
    #[serde(rename = "premium_color")]
    PremiumColor,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "snake_case")]
pub enum ProMode {
    #[default]
    User,
    Reader,
    Cinema,
    Designer,
    Office,
    Srgb,
    #[serde(rename = "adobe_rgb")]
    AdobeRgb,
    #[serde(rename = "dci_p3")]
    DciP3,
    Eco,
    #[serde(rename = "anti_blue")]
    AntiBlue,
    Movie,
}

// Phase 4: Input/System enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum InputSource {
    #[default]
    Hdmi1,
    Hdmi2,
    Dp,
    Usbc,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum ScreenSize {
    #[default]
    Auto,
    #[serde(rename = "4:3")]
    Ratio4x3,
    #[serde(rename = "16:9")]
    Ratio16x9,
    #[serde(rename = "21:9")]
    Ratio21x9,
    #[serde(rename = "1:1")]
    Ratio1x1,
    #[serde(rename = "19")]
    Size19,
    #[serde(rename = "24")]
    Size24,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum PowerButton {
    #[default]
    Off,
    Standby,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "snake_case")]
pub enum KvmMode {
    #[default]
    Auto,
    Upstream,
    #[serde(rename = "type_c")]
    TypeC,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum AudioSource {
    #[default]
    Analog,
    Digital,
}

/// Monitor settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorSettings {
    pub brightness: u8,
    pub contrast: u8,
    pub sharpness: u8,
    pub response_time: ResponseTime,
    pub eye_saver: bool,
    pub image_enhancement: ImageEnhancement,
    pub color_preset: ColorPreset,
    pub color_rgb: ColorRgb,
    pub hdcr: bool,
    pub refresh_rate_display: bool,
    // Phase 1: OSD settings
    pub osd_transparency: u8,
    pub osd_timeout: u8,
    // Phase 2: MAG Core settings
    pub night_vision: NightVision,
    pub black_tuner: u8,
    pub screen_assistance: ScreenAssistance,
    pub refresh_position: Position,
    pub alarm_clock: AlarmClock,
    pub alarm_position: Position,
    pub sound_enable: bool,
    // Phase 3: Performance settings
    pub zero_latency: bool,
    pub free_sync: bool,
    pub game_mode: GameMode,
    pub pro_mode: ProMode,
    // Phase 4: Input/System settings
    pub input: InputSource,
    pub auto_scan: bool,
    pub screen_info: bool,
    pub screen_size: ScreenSize,
    pub power_button: PowerButton,
    pub hdmi_cec: bool,
    pub kvm: KvmMode,
    pub audio_source: AudioSource,
    pub rgb_led: bool,
}

impl Default for MonitorSettings {
    fn default() -> Self {
        Self {
            brightness: 50,
            contrast: 50,
            sharpness: 0,
            response_time: ResponseTime::Normal,
            eye_saver: false,
            image_enhancement: ImageEnhancement::Off,
            color_preset: ColorPreset::Normal,
            color_rgb: ColorRgb { r: 50, g: 50, b: 50 },
            hdcr: false,
            refresh_rate_display: false,
            // Phase 1: OSD settings
            osd_transparency: 0,
            osd_timeout: 20,
            // Phase 2: MAG Core settings
            night_vision: NightVision::Off,
            black_tuner: 10,
            screen_assistance: ScreenAssistance::Off,
            refresh_position: Position::LeftTop,
            alarm_clock: AlarmClock::Off,
            alarm_position: Position::LeftTop,
            sound_enable: true,
            // Phase 3: Performance settings
            zero_latency: false,
            free_sync: false,
            game_mode: GameMode::User,
            pro_mode: ProMode::User,
            // Phase 4: Input/System settings
            input: InputSource::Hdmi1,
            auto_scan: true,
            screen_info: true,
            screen_size: ScreenSize::Auto,
            power_button: PowerButton::Off,
            hdmi_cec: false,
            kvm: KvmMode::Auto,
            audio_source: AudioSource::Analog,
            rgb_led: true,
        }
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MysticLightConfig {
    pub led_group: String,
    pub mode: MysticLightMode,
    pub colors: Vec<String>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MysticLightMode {
    Off,
    Static,
    Breathing,
    Blinking,
    Flashing,
    #[serde(rename = "double_flashing")]
    DoubleFlashing,
    Lightning,
    Rainbow,
    Meteor,
    #[serde(rename = "rainbow_gradient")]
    RainbowGradient,
}
