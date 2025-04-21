#include<raylib.h>

int create_window(void) {
    const int monitor = GetCurrentMonitor();
    const int screen_width = GetMonitorWidth(monitor);
    const int screen_height = GetMonitorHeight(monitor);

    InitWindow(screen_width, screen_height, "Assembly Visualizer");

    while (!WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(GRAY);
        DrawText("Hello, world!", 0, 0, 11, WHITE);
        EndDrawing();
    }

    CloseWindow();

    return 0;
}