#include <raylib.h>

int create_window(void) {
    const int monitor = GetCurrentMonitor();
    const int screen_width = GetMonitorWidth(monitor);
    const int screen_height = GetMonitorHeight(monitor);
    const char* working_dir = GetWorkingDirectory();
    FilePathList files = LoadDirectoryFiles(working_dir);

    InitWindow(screen_width, screen_height, "Assembly Visualizer");
    SetTargetFPS(60);

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(GRAY);

        for (int i = 0; i < files.count; i++) {
            DrawText(files.paths[i], 20, 40 + i * 20, 18, RAYWHITE);
        }

        EndDrawing();
    }

    UnloadDirectoryFiles(files);
    CloseWindow();

    return 0;
}
