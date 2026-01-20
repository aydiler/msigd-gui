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
            refresh_rate_display: Self::parse_bool(&values, "refresh_rate_display").unwrap_or(false),
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
