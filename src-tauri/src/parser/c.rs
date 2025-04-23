use std::process::Command;
use std::fs;
use std::path::Path;
use std::io::{self, Error, ErrorKind};

pub fn get_asm_from_c(file_name: &str) -> Result<String, io::Error> {
    let path = Path::new(file_name);
    let file_stem = path.file_stem().ok_or_else(|| {
        Error::new(ErrorKind::InvalidInput, "Invalid file name")
    })?;
    
    let output_file = path.with_file_name(format!("{}.s", file_stem.to_string_lossy()));
    
    let status = Command::new("gcc")
        .arg("-S")
        .arg(file_name)
        .status()?;
    
    if !status.success() {
        return Err(Error::new(
            ErrorKind::Other, 
            format!("GCC exited with status: {}", status)
        ));
    }
    
    if !output_file.exists() {
        return Err(Error::new(
            ErrorKind::NotFound, 
            format!("Assembly output file not found: {}", output_file.display())
        ));
    }
    
    let asm_content = fs::read_to_string(&output_file)?;
    
    Ok(asm_content)
}