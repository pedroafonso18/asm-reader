use std::env;
use std::path::PathBuf;
use std::fs;
use walkdir::WalkDir;
use serde::{Serialize, Deserialize};
mod parser;


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
fn get_asm_from_file(filename: String) -> Result<String, String> {
    if filename.ends_with(".c") {
        parser::c::get_asm_from_c(&filename).map_err(|e| e.to_string())
    } else {
        Err("Unsupported file type. Only .c files are supported.".into())
    }
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

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            list_directory, 
            get_asm_from_file,
            read_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}