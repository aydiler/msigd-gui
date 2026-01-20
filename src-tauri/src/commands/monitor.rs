//! Monitor-related Tauri commands

use tauri::command;

use crate::error::MsigdError;
use crate::msigd::{MsigdExecutor, MsigdParser, Monitor, MonitorSettings};

/// List all connected MSI monitors
#[command]
pub fn list_monitors() -> Result<Vec<Monitor>, MsigdError> {
    let output = MsigdExecutor::list_monitors()?;
    MsigdParser::parse_monitor_list(&output)
}

/// Get settings for a specific monitor
#[command]
pub fn get_monitor_settings(monitor_id: String) -> Result<MonitorSettings, MsigdError> {
    let output = MsigdExecutor::query_monitor(&monitor_id)?;
    MsigdParser::parse_settings(&output)
}

/// Set brightness (0-100)
#[command]
pub fn set_brightness(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 100 {
        return Err(MsigdError::InvalidValue(
            "Brightness must be 0-100".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "brightness", value)?;
    Ok(())
}

/// Set contrast (0-100)
#[command]
pub fn set_contrast(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 100 {
        return Err(MsigdError::InvalidValue(
            "Contrast must be 0-100".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "contrast", value)?;
    Ok(())
}

/// Set sharpness (0-5)
#[command]
pub fn set_sharpness(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 5 {
        return Err(MsigdError::InvalidValue(
            "Sharpness must be 0-5".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "sharpness", value)?;
    Ok(())
}

/// Set response time
#[command]
pub fn set_response_time(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["normal", "fast", "fastest"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Response time must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "response_time", &value)?;
    Ok(())
}

/// Set eye saver mode
#[command]
pub fn set_eye_saver(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "eye_saver", value)?;
    Ok(())
}

/// Check if msigd is available
#[command]
pub fn check_msigd_available() -> Result<bool, MsigdError> {
    MsigdExecutor::check_available()
}

/// Set color preset (cool, normal, warm, custom)
#[command]
pub fn set_color_preset(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["cool", "normal", "warm", "custom"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Color preset must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "color_preset", &value)?;
    Ok(())
}

/// Set color RGB values (0-100 each)
#[command]
pub fn set_color_rgb(monitor_id: String, r: u8, g: u8, b: u8) -> Result<(), MsigdError> {
    if r > 100 || g > 100 || b > 100 {
        return Err(MsigdError::InvalidValue(
            "RGB values must be 0-100".to_string(),
        ));
    }
    MsigdExecutor::set_color_rgb(&monitor_id, r, g, b)?;
    Ok(())
}

/// Set image enhancement mode
#[command]
pub fn set_image_enhancement(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["off", "weak", "medium", "strong", "strongest"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Image enhancement must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "image_enhancement", &value)?;
    Ok(())
}

/// Set HDCR (High Dynamic Contrast Ratio)
#[command]
pub fn set_hdcr(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "hdcr", value)?;
    Ok(())
}

/// Set refresh rate display (show refresh rate on screen)
#[command]
pub fn set_refresh_rate_display(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    // msigd uses "refresh_display" not "refresh_rate_display"
    MsigdExecutor::set_enum(&monitor_id, "refresh_display", value)?;
    Ok(())
}

/// Set Mystic Light LED configuration
#[command]
pub fn set_mystic_light(monitor_id: String, config: String) -> Result<(), MsigdError> {
    MsigdExecutor::set_mystic_light(&monitor_id, &config)?;
    Ok(())
}
