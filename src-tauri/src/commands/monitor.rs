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

// Phase 1: OSD Settings

/// Set OSD transparency (0-5)
#[command]
pub fn set_osd_transparency(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 5 {
        return Err(MsigdError::InvalidValue(
            "OSD transparency must be 0-5".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "osd_transparency", value)?;
    Ok(())
}

/// Set OSD timeout (0-30 seconds)
#[command]
pub fn set_osd_timeout(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 30 {
        return Err(MsigdError::InvalidValue(
            "OSD timeout must be 0-30".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "osd_timeout", value)?;
    Ok(())
}

// Phase 2: MAG Core Settings

/// Set night vision mode
#[command]
pub fn set_night_vision(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["off", "normal", "strong", "strongest", "ai"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Night vision must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "night_vision", &value)?;
    Ok(())
}

/// Set black tuner (0-20)
#[command]
pub fn set_black_tuner(monitor_id: String, value: u8) -> Result<(), MsigdError> {
    if value > 20 {
        return Err(MsigdError::InvalidValue(
            "Black tuner must be 0-20".to_string(),
        ));
    }
    MsigdExecutor::set_numeric(&monitor_id, "black_tuner", value)?;
    Ok(())
}

/// Set screen assistance (crosshair)
#[command]
pub fn set_screen_assistance(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = [
        "off", "red1", "red2", "red3", "red4", "red5", "red6",
        "white1", "white2", "white3", "white4", "white5", "white6",
    ];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Screen assistance must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "screen_assistance", &value)?;
    Ok(())
}

/// Set refresh rate display position
#[command]
pub fn set_refresh_position(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["left_top", "right_top", "left_bottom", "right_bottom"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Refresh position must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "refresh_position", &value)?;
    Ok(())
}

/// Set alarm clock timer
#[command]
pub fn set_alarm_clock(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["off", "1", "2", "3", "4"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Alarm clock must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "alarm_clock", &value)?;
    Ok(())
}

/// Set alarm clock position
#[command]
pub fn set_alarm_position(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["left_top", "right_top", "left_bottom", "right_bottom"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Alarm position must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "alarm_position", &value)?;
    Ok(())
}

/// Set sound enable
#[command]
pub fn set_sound_enable(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "sound_enable", value)?;
    Ok(())
}

// Phase 3: Performance Settings

/// Set zero latency mode
#[command]
pub fn set_zero_latency(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "zero_latency", value)?;
    Ok(())
}

/// Set FreeSync
#[command]
pub fn set_free_sync(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "free_sync", value)?;
    Ok(())
}

/// Set game mode
#[command]
pub fn set_game_mode(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["user", "fps", "racing", "rts", "rpg", "premium_color"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Game mode must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "game_mode", &value)?;
    Ok(())
}

/// Set pro mode
#[command]
pub fn set_pro_mode(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = [
        "user", "reader", "cinema", "designer", "office", "srgb",
        "adobe_rgb", "dci_p3", "eco", "anti_blue", "movie",
    ];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Pro mode must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "pro_mode", &value)?;
    Ok(())
}

// Phase 4: Input/System Settings

/// Set input source
#[command]
pub fn set_input(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["hdmi1", "hdmi2", "dp", "usbc"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Input must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "input", &value)?;
    Ok(())
}

/// Set auto scan
#[command]
pub fn set_auto_scan(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "auto_scan", value)?;
    Ok(())
}

/// Set screen info display
#[command]
pub fn set_screen_info(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "screen_info", value)?;
    Ok(())
}

/// Set screen size
#[command]
pub fn set_screen_size(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["auto", "4:3", "16:9", "21:9", "1:1", "19", "24"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Screen size must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "screen_size", &value)?;
    Ok(())
}

/// Set power button behavior
#[command]
pub fn set_power_button(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["off", "standby"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Power button must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "power_button", &value)?;
    Ok(())
}

/// Set HDMI CEC
#[command]
pub fn set_hdmi_cec(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "hdmi_cec", value)?;
    Ok(())
}

/// Set KVM mode
#[command]
pub fn set_kvm(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["auto", "upstream", "type_c"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "KVM must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "kvm", &value)?;
    Ok(())
}

/// Set audio source
#[command]
pub fn set_audio_source(monitor_id: String, value: String) -> Result<(), MsigdError> {
    let valid_values = ["analog", "digital"];
    if !valid_values.contains(&value.as_str()) {
        return Err(MsigdError::InvalidValue(format!(
            "Audio source must be one of: {}",
            valid_values.join(", ")
        )));
    }
    MsigdExecutor::set_enum(&monitor_id, "audio_source", &value)?;
    Ok(())
}

/// Set RGB LED
#[command]
pub fn set_rgb_led(monitor_id: String, enabled: bool) -> Result<(), MsigdError> {
    let value = if enabled { "on" } else { "off" };
    MsigdExecutor::set_enum(&monitor_id, "rgb_led", value)?;
    Ok(())
}
