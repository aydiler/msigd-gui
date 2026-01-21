//! Parser for msigd CLI output

use std::collections::HashMap;

use crate::error::MsigdError;
use crate::msigd::types::*;

/// Parser for msigd output
pub struct MsigdParser;

impl MsigdParser {
    /// Parse --list output into Monitor structs
    ///
    /// Actual msigd --list format:
    /// ```text
    /// 1,A02019010700,MS,MSI Gaming Controller,/dev/hidraw4
    /// 2,A02019010700,MS,MSI Gaming Controller,/dev/hidraw1
    /// ```
    /// Format: index,serial,vendor,model,device_path
    pub fn parse_monitor_list(output: &str) -> Result<Vec<Monitor>, MsigdError> {
        let mut monitors = Vec::new();

        for line in output.lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }

            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() >= 4 {
                monitors.push(Monitor {
                    id: parts[0].to_string(),
                    serial: parts[1].to_string(),
                    model: parts[3].to_string(),
                    firmware: "Unknown".to_string(), // Not provided in list output
                });
            }
        }

        Ok(monitors)
    }

    /// Parse --query --numeric output into MonitorSettings
    ///
    /// Expected format:
    /// ```text
    /// brightness: 75
    /// contrast: 50
    /// sharpness: 3
    /// response_time: fast
    /// eye_saver: off
    /// ```
    pub fn parse_settings(output: &str) -> Result<MonitorSettings, MsigdError> {
        let mut values: HashMap<String, String> = HashMap::new();

        for line in output.lines() {
            let line = line.trim();
            if let Some((key, value)) = line.split_once(':') {
                let key = key.trim().to_lowercase().replace(' ', "_");
                let value = value.trim().to_string();
                values.insert(key, value);
            }
        }

        Ok(MonitorSettings {
            brightness: Self::parse_u8(&values, "brightness").unwrap_or(50),
            contrast: Self::parse_u8(&values, "contrast").unwrap_or(50),
            sharpness: Self::parse_u8(&values, "sharpness").unwrap_or(0),
            response_time: Self::parse_response_time(&values).unwrap_or(ResponseTime::Normal),
            eye_saver: Self::parse_bool(&values, "eye_saver").unwrap_or(false),
            image_enhancement: Self::parse_image_enhancement(&values)
                .unwrap_or(ImageEnhancement::Off),
            color_preset: Self::parse_color_preset(&values).unwrap_or(ColorPreset::Normal),
            color_rgb: Self::parse_color_rgb(&values).unwrap_or(ColorRgb { r: 50, g: 50, b: 50 }),
            hdcr: Self::parse_bool(&values, "hdcr").unwrap_or(false),
            // msigd outputs "refresh_display" not "refresh_rate_display"
            refresh_rate_display: Self::parse_bool(&values, "refresh_display").unwrap_or(false),
            // Phase 1: OSD settings
            osd_transparency: Self::parse_u8(&values, "osd_transparency").unwrap_or(0),
            osd_timeout: Self::parse_u8(&values, "osd_timeout").unwrap_or(20),
            // Phase 2: MAG Core settings
            night_vision: Self::parse_night_vision(&values).unwrap_or(NightVision::Off),
            black_tuner: Self::parse_u8(&values, "black_tuner").unwrap_or(10),
            screen_assistance: Self::parse_screen_assistance(&values)
                .unwrap_or(ScreenAssistance::Off),
            refresh_position: Self::parse_position(&values, "refresh_position")
                .unwrap_or(Position::LeftTop),
            alarm_clock: Self::parse_alarm_clock(&values).unwrap_or(AlarmClock::Off),
            alarm_position: Self::parse_position(&values, "alarm_position")
                .unwrap_or(Position::LeftTop),
            sound_enable: Self::parse_bool(&values, "sound_enable").unwrap_or(true),
            // Phase 3: Performance settings
            zero_latency: Self::parse_bool(&values, "zero_latency").unwrap_or(false),
            free_sync: Self::parse_bool(&values, "free_sync").unwrap_or(false),
            game_mode: Self::parse_game_mode(&values).unwrap_or(GameMode::User),
            pro_mode: Self::parse_pro_mode(&values).unwrap_or(ProMode::User),
            // Phase 4: Input/System settings
            input: Self::parse_input(&values).unwrap_or(InputSource::Hdmi1),
            auto_scan: Self::parse_bool(&values, "auto_scan").unwrap_or(true),
            screen_info: Self::parse_bool(&values, "screen_info").unwrap_or(true),
            screen_size: Self::parse_screen_size(&values).unwrap_or(ScreenSize::Auto),
            power_button: Self::parse_power_button(&values).unwrap_or(PowerButton::Off),
            hdmi_cec: Self::parse_bool(&values, "hdmi_cec").unwrap_or(false),
            kvm: Self::parse_kvm(&values).unwrap_or(KvmMode::Auto),
            audio_source: Self::parse_audio_source(&values).unwrap_or(AudioSource::Analog),
            rgb_led: Self::parse_bool(&values, "rgb_led").unwrap_or(true),
        })
    }

    fn parse_u8(values: &HashMap<String, String>, key: &str) -> Option<u8> {
        values.get(key).and_then(|v| v.parse().ok())
    }

    fn parse_bool(values: &HashMap<String, String>, key: &str) -> Option<bool> {
        values.get(key).map(|v| v == "on" || v == "1" || v == "true")
    }

    fn parse_response_time(values: &HashMap<String, String>) -> Option<ResponseTime> {
        values.get("response_time").and_then(|v| match v.as_str() {
            "normal" | "0" => Some(ResponseTime::Normal),
            "fast" | "1" => Some(ResponseTime::Fast),
            "fastest" | "2" => Some(ResponseTime::Fastest),
            _ => None,
        })
    }

    fn parse_image_enhancement(values: &HashMap<String, String>) -> Option<ImageEnhancement> {
        values
            .get("image_enhancement")
            .and_then(|v| match v.as_str() {
                "off" | "0" => Some(ImageEnhancement::Off),
                "weak" | "1" => Some(ImageEnhancement::Weak),
                "medium" | "2" => Some(ImageEnhancement::Medium),
                "strong" | "3" => Some(ImageEnhancement::Strong),
                "strongest" | "4" => Some(ImageEnhancement::Strongest),
                _ => None,
            })
    }

    fn parse_color_preset(values: &HashMap<String, String>) -> Option<ColorPreset> {
        values.get("color_preset").and_then(|v| match v.as_str() {
            "cool" | "0" => Some(ColorPreset::Cool),
            "normal" | "1" => Some(ColorPreset::Normal),
            "warm" | "2" => Some(ColorPreset::Warm),
            "custom" | "3" => Some(ColorPreset::Custom),
            _ => None,
        })
    }

    fn parse_color_rgb(values: &HashMap<String, String>) -> Option<ColorRgb> {
        // Try individual color values first
        let r = Self::parse_u8(values, "color_red").or_else(|| Self::parse_u8(values, "red"));
        let g = Self::parse_u8(values, "color_green").or_else(|| Self::parse_u8(values, "green"));
        let b = Self::parse_u8(values, "color_blue").or_else(|| Self::parse_u8(values, "blue"));

        if let (Some(r), Some(g), Some(b)) = (r, g, b) {
            return Some(ColorRgb { r, g, b });
        }

        // Try color_rgb format "r:g:b"
        values.get("color_rgb").and_then(|v| {
            let parts: Vec<&str> = v.split(':').collect();
            if parts.len() == 3 {
                let r = parts[0].parse().ok()?;
                let g = parts[1].parse().ok()?;
                let b = parts[2].parse().ok()?;
                Some(ColorRgb { r, g, b })
            } else {
                None
            }
        })
    }

    // Phase 2: MAG Core parsers
    fn parse_night_vision(values: &HashMap<String, String>) -> Option<NightVision> {
        values.get("night_vision").and_then(|v| match v.as_str() {
            "off" | "0" => Some(NightVision::Off),
            "normal" | "1" => Some(NightVision::Normal),
            "strong" | "2" => Some(NightVision::Strong),
            "strongest" | "3" => Some(NightVision::Strongest),
            "ai" | "4" => Some(NightVision::Ai),
            _ => None,
        })
    }

    fn parse_position(values: &HashMap<String, String>, key: &str) -> Option<Position> {
        values.get(key).and_then(|v| match v.as_str() {
            "left_top" | "0" => Some(Position::LeftTop),
            "right_top" | "1" => Some(Position::RightTop),
            "left_bottom" | "2" => Some(Position::LeftBottom),
            "right_bottom" | "3" => Some(Position::RightBottom),
            _ => None,
        })
    }

    fn parse_screen_assistance(values: &HashMap<String, String>) -> Option<ScreenAssistance> {
        values.get("screen_assistance").and_then(|v| match v.as_str() {
            "off" | "0" => Some(ScreenAssistance::Off),
            "red1" | "1" => Some(ScreenAssistance::Red1),
            "red2" | "2" => Some(ScreenAssistance::Red2),
            "red3" | "3" => Some(ScreenAssistance::Red3),
            "red4" | "4" => Some(ScreenAssistance::Red4),
            "red5" | "5" => Some(ScreenAssistance::Red5),
            "red6" | "6" => Some(ScreenAssistance::Red6),
            "white1" | "7" => Some(ScreenAssistance::White1),
            "white2" | "8" => Some(ScreenAssistance::White2),
            "white3" | "9" => Some(ScreenAssistance::White3),
            "white4" | "10" => Some(ScreenAssistance::White4),
            "white5" | "11" => Some(ScreenAssistance::White5),
            "white6" | "12" => Some(ScreenAssistance::White6),
            _ => None,
        })
    }

    fn parse_alarm_clock(values: &HashMap<String, String>) -> Option<AlarmClock> {
        values.get("alarm_clock").and_then(|v| match v.as_str() {
            "off" | "0" => Some(AlarmClock::Off),
            "1" => Some(AlarmClock::One),
            "2" => Some(AlarmClock::Two),
            "3" => Some(AlarmClock::Three),
            "4" => Some(AlarmClock::Four),
            _ => None,
        })
    }

    // Phase 3: Performance parsers
    fn parse_game_mode(values: &HashMap<String, String>) -> Option<GameMode> {
        values.get("game_mode").and_then(|v| match v.as_str() {
            "user" | "0" => Some(GameMode::User),
            "fps" | "1" => Some(GameMode::Fps),
            "racing" | "2" => Some(GameMode::Racing),
            "rts" | "3" => Some(GameMode::Rts),
            "rpg" | "4" => Some(GameMode::Rpg),
            "premium_color" | "5" => Some(GameMode::PremiumColor),
            _ => None,
        })
    }

    fn parse_pro_mode(values: &HashMap<String, String>) -> Option<ProMode> {
        values.get("pro_mode").and_then(|v| match v.as_str() {
            "user" | "0" => Some(ProMode::User),
            "reader" | "1" => Some(ProMode::Reader),
            "cinema" | "2" => Some(ProMode::Cinema),
            "designer" | "3" => Some(ProMode::Designer),
            "office" | "4" => Some(ProMode::Office),
            "srgb" | "5" => Some(ProMode::Srgb),
            "adobe_rgb" | "6" => Some(ProMode::AdobeRgb),
            "dci_p3" | "7" => Some(ProMode::DciP3),
            "eco" | "8" => Some(ProMode::Eco),
            "anti_blue" | "9" => Some(ProMode::AntiBlue),
            "movie" | "10" => Some(ProMode::Movie),
            _ => None,
        })
    }

    // Phase 4: Input/System parsers
    fn parse_input(values: &HashMap<String, String>) -> Option<InputSource> {
        values.get("input").and_then(|v| match v.as_str() {
            "hdmi1" | "0" => Some(InputSource::Hdmi1),
            "hdmi2" | "1" => Some(InputSource::Hdmi2),
            "dp" | "2" => Some(InputSource::Dp),
            "usbc" | "3" => Some(InputSource::Usbc),
            _ => None,
        })
    }

    fn parse_screen_size(values: &HashMap<String, String>) -> Option<ScreenSize> {
        values.get("screen_size").and_then(|v| match v.as_str() {
            "auto" | "0" => Some(ScreenSize::Auto),
            "4:3" | "1" => Some(ScreenSize::Ratio4x3),
            "16:9" | "2" => Some(ScreenSize::Ratio16x9),
            "21:9" | "3" => Some(ScreenSize::Ratio21x9),
            "1:1" | "4" => Some(ScreenSize::Ratio1x1),
            "19" | "5" => Some(ScreenSize::Size19),
            "24" | "6" => Some(ScreenSize::Size24),
            _ => None,
        })
    }

    fn parse_power_button(values: &HashMap<String, String>) -> Option<PowerButton> {
        values.get("power_button").and_then(|v| match v.as_str() {
            "off" | "0" => Some(PowerButton::Off),
            "standby" | "1" => Some(PowerButton::Standby),
            _ => None,
        })
    }

    fn parse_kvm(values: &HashMap<String, String>) -> Option<KvmMode> {
        values.get("kvm").and_then(|v| match v.as_str() {
            "auto" | "0" => Some(KvmMode::Auto),
            "upstream" | "1" => Some(KvmMode::Upstream),
            "type_c" | "2" => Some(KvmMode::TypeC),
            _ => None,
        })
    }

    fn parse_audio_source(values: &HashMap<String, String>) -> Option<AudioSource> {
        values.get("audio_source").and_then(|v| match v.as_str() {
            "analog" | "0" => Some(AudioSource::Analog),
            "digital" | "1" => Some(AudioSource::Digital),
            _ => None,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_monitor_list() {
        let output = "1,A02019010700,MS,MSI Gaming Controller,/dev/hidraw4\n\
                      2,B02019010701,MS,MAG274QRF-QD,/dev/hidraw1";

        let monitors = MsigdParser::parse_monitor_list(output).unwrap();

        assert_eq!(monitors.len(), 2);
        assert_eq!(monitors[0].id, "1");
        assert_eq!(monitors[0].serial, "A02019010700");
        assert_eq!(monitors[0].model, "MSI Gaming Controller");
        assert_eq!(monitors[1].id, "2");
        assert_eq!(monitors[1].serial, "B02019010701");
        assert_eq!(monitors[1].model, "MAG274QRF-QD");
    }

    #[test]
    fn test_parse_settings() {
        let output = "brightness: 75\n\
                      contrast: 50\n\
                      sharpness: 3\n\
                      response_time: fast\n\
                      eye_saver: off";

        let settings = MsigdParser::parse_settings(output).unwrap();

        assert_eq!(settings.brightness, 75);
        assert_eq!(settings.contrast, 50);
        assert_eq!(settings.sharpness, 3);
        assert_eq!(settings.response_time, ResponseTime::Fast);
        assert!(!settings.eye_saver);
    }
}
