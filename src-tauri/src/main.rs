//! MSI Gaming Device GUI - Entry point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    msigd_gui_lib::run();
}
