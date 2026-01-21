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
        }
    }
}

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
