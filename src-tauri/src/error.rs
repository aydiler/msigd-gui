//! Error types for msigd-gui

use serde::Serialize;
use thiserror::Error;

/// Application-level errors
#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum MsigdError {
    #[error("Failed to execute msigd: {0}")]
    ExecutionFailed(String),

    #[error("Command failed: {0}")]
    CommandFailed(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Invalid value: {0}")]
    InvalidValue(String),

    #[error("Monitor not found: {0}")]
    MonitorNotFound(String),

    #[error("Shell error: {0}")]
    ShellError(String),
}

// Tauri 2.0 requires serializable errors for commands
impl Serialize for MsigdError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
