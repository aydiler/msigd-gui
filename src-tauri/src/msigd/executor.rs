//! Executor for msigd CLI commands

use std::process::Command;
use crate::error::MsigdError;

/// Executor for msigd CLI commands using std::process
pub struct MsigdExecutor;

impl MsigdExecutor {
    /// Execute msigd with the given arguments
    pub fn execute(args: &[&str]) -> Result<String, MsigdError> {
        let output = Command::new("msigd")
            .args(args)
            .output()
            .map_err(|e| MsigdError::ExecutionFailed(e.to_string()))?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        // msigd may return non-zero exit code but still output valid data
        // (e.g., when some settings can't be queried but others can)
        // If we have stdout with actual settings data, use it
        if !stdout.is_empty() && stdout.contains(':') {
            // Looks like we have setting data (format: "setting : value")
            Ok(stdout)
        } else if output.status.success() {
            Ok(stdout)
        } else if !stderr.is_empty() {
            Err(MsigdError::CommandFailed(stderr))
        } else {
            Err(MsigdError::CommandFailed(stdout))
        }
    }

    /// List all connected monitors
    pub fn list_monitors() -> Result<String, MsigdError> {
        Self::execute(&["--list"])
    }

    /// Query settings for a specific monitor
    pub fn query_monitor(monitor_id: &str) -> Result<String, MsigdError> {
        Self::execute(&["--monitor", monitor_id, "--query", "--numeric"])
    }

    /// Set a numeric setting (brightness, contrast, sharpness)
    pub fn set_numeric(
        monitor_id: &str,
        setting: &str,
        value: u8,
    ) -> Result<String, MsigdError> {
        let value_str = value.to_string();
        let flag = format!("--{}", setting);
        Self::execute(&["--monitor", monitor_id, &flag, &value_str])
    }

    /// Set an enum setting (response_time, eye_saver, etc.)
    pub fn set_enum(
        monitor_id: &str,
        setting: &str,
        value: &str,
    ) -> Result<String, MsigdError> {
        let flag = format!("--{}", setting);
        Self::execute(&["--monitor", monitor_id, &flag, value])
    }

    /// Set color RGB values
    /// msigd expects comma-separated format: r,g,b (e.g., "50,50,50")
    pub fn set_color_rgb(
        monitor_id: &str,
        r: u8,
        g: u8,
        b: u8,
    ) -> Result<String, MsigdError> {
        let value = format!("{},{},{}", r, g, b);
        Self::execute(&["--monitor", monitor_id, "--color_rgb", &value])
    }

    /// Set Mystic Light LED configuration
    pub fn set_mystic_light(
        monitor_id: &str,
        config: &str,
    ) -> Result<String, MsigdError> {
        Self::execute(&["--monitor", monitor_id, "--mystic", config])
    }

    /// Check if msigd binary exists and is accessible
    pub fn check_available() -> Result<bool, MsigdError> {
        match Self::execute(&["--help"]) {
            Ok(_) => Ok(true),
            Err(MsigdError::CommandFailed(_)) => Ok(true), // --help might exit with non-zero
            Err(_) => Ok(false),
        }
    }
}
