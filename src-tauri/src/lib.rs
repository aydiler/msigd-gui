//! MSI Gaming Device GUI - Tauri backend

mod commands;
mod error;
mod msigd;

use commands::monitor;
use tauri::{webview::WebviewWindowBuilder, WebviewUrl};

/// Run the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port: u16 = 9527;

    tauri::Builder::default()
        // Use localhost plugin to serve assets via HTTP (fixes WebKitGTK issues on Linux)
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
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
        ])
        .setup(move |app| {
            let url = format!("http://localhost:{}/index.html", port).parse().unwrap();
            WebviewWindowBuilder::new(app, "main", WebviewUrl::External(url))
                .title("MSI Monitor Control")
                .inner_size(480.0, 680.0)
                .min_inner_size(400.0, 500.0)
                .resizable(true)
                .center()
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
