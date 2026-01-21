//! MSI Gaming Device GUI - Tauri backend

mod commands;
mod error;
mod msigd;

use commands::monitor;

/// Run the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Force X11 backend and configure WebKit for better compatibility
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("GDK_BACKEND", "x11");
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        // Register all command handlers
        .invoke_handler(tauri::generate_handler![
            // Monitor commands
            monitor::list_monitors,
            monitor::get_monitor_settings,
            monitor::set_brightness,
            monitor::set_contrast,
            monitor::set_sharpness,
            monitor::set_response_time,
            monitor::set_eye_saver,
            monitor::check_msigd_available,
            // Color commands
            monitor::set_color_preset,
            monitor::set_color_rgb,
            // Advanced commands
            monitor::set_image_enhancement,
            monitor::set_hdcr,
            monitor::set_refresh_rate_display,
            // LED commands
            monitor::set_mystic_light,
            // Phase 1: OSD commands
            monitor::set_osd_transparency,
            monitor::set_osd_timeout,
            // Phase 2: MAG Core commands
            monitor::set_night_vision,
            monitor::set_black_tuner,
            monitor::set_screen_assistance,
            monitor::set_refresh_position,
            monitor::set_alarm_clock,
            monitor::set_alarm_position,
            monitor::set_sound_enable,
            // Phase 3: Performance commands
            monitor::set_zero_latency,
            monitor::set_free_sync,
            monitor::set_game_mode,
            monitor::set_pro_mode,
            // Phase 4: Input/System commands
            monitor::set_input,
            monitor::set_auto_scan,
            monitor::set_screen_info,
            monitor::set_screen_size,
            monitor::set_power_button,
            monitor::set_hdmi_cec,
            monitor::set_kvm,
            monitor::set_audio_source,
            monitor::set_rgb_led,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
