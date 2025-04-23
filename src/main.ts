import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let dirResultEl: HTMLElement | null;
let currentPath = "./";

async function greet() {
  if (greetMsgEl && greetInputEl) {
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

// Wait for the DOM to load before running code
window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  dirResultEl = document.querySelector("#dir-result");
  
  // Call getDirectory on startup
  loadDirectory("./");
  
  // Set up the greet form event handler
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

async function loadDirectory(path: string) {
  try {
    if (!dirResultEl) return;
    
    currentPath = path;
    dirResultEl.innerHTML = "Loading...";
    
    const entries = await invoke('list_directory', { path }) as {
      name: string;
      path: string;
      is_dir: boolean;  
    }[];

    console.log(entries);
    
    // Clear the loading message
    dirResultEl.innerHTML = "";
    
    // Create a file list
    const fileList = document.createElement("ul");
    fileList.className = "file-list";
    
    // Add parent directory link (unless we're at the root)
    const pathParts = path.split(/[/\\]/);
    if (path !== "./" && path !== "/") {
      const parentDir = document.createElement("li");
      parentDir.className = "directory parent-dir";
      parentDir.innerHTML = `📂 ../ <span class="item-desc">Parent Directory</span>`;
      
      parentDir.addEventListener("click", () => {
        // Remove the last part of the path to go up one level
        pathParts.pop();
        if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === '.')) {
          loadDirectory("./");
        } else {
          loadDirectory(pathParts.join('/'));
        }
      });
      
      fileList.appendChild(parentDir);
    }
    
    // Add current path indicator
    const pathIndicator = document.createElement("div");
    pathIndicator.className = "current-path";
    pathIndicator.textContent = `Current location: ${path}`;
    dirResultEl.appendChild(pathIndicator);
    
    if (entries.length === 0) {
      const emptyNotice = document.createElement("p");
      emptyNotice.className = "empty-directory";
      emptyNotice.textContent = "This directory is empty";
      dirResultEl.appendChild(emptyNotice);
      return;
    }
    
    // Add each file/directory to the list
    entries.forEach(entry => {
      const item = document.createElement("li");
      const icon = entry.is_dir ? "📁" : "📄";
      
      item.innerHTML = `${icon} ${entry.name} <span class="item-desc">${entry.is_dir ? 'Directory' : 'File'}</span>`;
      item.className = entry.is_dir ? "directory" : "file";
      
      // Add click event for directories to navigate into them
      if (entry.is_dir) {
        item.addEventListener("click", () => {
          loadDirectory(entry.path);
        });
      } else if (entry.name.endsWith('.c')) {
        // Handle clicks on C files
        item.addEventListener("click", () => {
          openCFileViewer(entry.path);
        });
      }
      
      fileList.appendChild(item);
    });
    
    dirResultEl.appendChild(fileList);
    
  } catch (error) {
    console.error("Failed to load directory:", error);
    if (dirResultEl) {
      dirResultEl.textContent = `Error loading directory: ${error}`;
    }
  }
}

async function openCFileViewer(filePath: string) {
  try {
    // Clear the directory listing
    if (!dirResultEl) return;
    dirResultEl.innerHTML = "Loading C file and generating assembly...";
    
    // Use our Rust backend command to read the file content instead of direct fs access
    const cFileContent = await invoke('read_file_content', { path: filePath }) as string;
    
    // Get the assembly from the Rust function
    const asmContent = await invoke('get_asm_from_file', { filename: filePath }) as string;
    
    // Create the side-by-side viewer
    createSideBySideView(filePath, cFileContent, asmContent);
    
  } catch (error) {
    console.error("Failed to process C file:", error);
    if (dirResultEl) {
      dirResultEl.innerHTML = `<div class="error-message">Error processing file: ${error}</div>
                               <button class="back-button" id="back-to-dir">Back to Directory</button>`;
      
      document.getElementById('back-to-dir')?.addEventListener('click', () => {
        loadDirectory(currentPath);
      });
    }
  }
}

function createSideBySideView(filePath: string, cContent: string, asmContent: string) {
  if (!dirResultEl) return;
  
  // Extract just the filename from the path
  const fileName = filePath.split(/[/\\]/).pop() || filePath;
  
  // Create the viewer container
  dirResultEl.innerHTML = `
    <div class="file-viewer-container">
      <div class="file-viewer-header">
        <h3>${fileName}</h3>
        <button class="back-button" id="back-to-dir">Back to Directory</button>
      </div>
      <div class="file-viewer-content">
        <div class="file-panel">
          <div class="panel-header">C Source</div>
          <pre class="code-content c-code">${escapeHtml(cContent)}</pre>
        </div>
        <div class="file-panel">
          <div class="panel-header">Assembly Output</div>
          <pre class="code-content asm-code">${escapeHtml(asmContent)}</pre>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener for the back button
  document.getElementById('back-to-dir')?.addEventListener('click', () => {
    loadDirectory(currentPath);
  });
}

// Helper function to safely escape HTML
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}