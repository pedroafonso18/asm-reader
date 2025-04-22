use std::env;
use std::path::PathBuf;
use walkdir::WalkDir;
use serde::{Serialize, Deserialize};


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let current_dir = PathBuf::from(&path);

    if !current_dir.exists() {
        return Err("Directory does not exist.".into());
    }

    let entries = WalkDir::new(&current_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path() != current_dir)
        .map(|entry| FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: entry.file_type().is_dir(),
        })
        .collect::<Vec<FileEntry>>();

    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, list_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}