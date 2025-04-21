#include<raylib.h>

int create_window(void) {
    const int monitor = GetCurrentMonitor();
    const int screen_width = GetMonitorWidth(monitor);
    const int screen_height = GetMonitorHeight(monitor);
    const char* working_dir = GetWorkingDirectory();
    InitWindow(screen_width, screen_height, "Assembly Visualizer");

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(GRAY);
        DrawText(working_dir, screen_width/2, screen_height/2, 11, WHITE);
        EndDrawing();
    }

    CloseWindow();

    return 0;
}