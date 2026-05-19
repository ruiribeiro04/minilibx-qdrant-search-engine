# MiniLibX Window Module

The Window module provides the fundamental building blocks for creating, managing, and removing graphical windows in an X11 environment. Together with `mlx_init()`, it forms the core of any MiniLibX application. `mlx_new_window()` creates a visible window with a given title and dimensions. `mlx_clear_window()` fills the entire window with black (color 0). `mlx_destroy_window()` removes the window and frees its associated resources. Understanding the life‑cycle—init, create windows, draw, handle events, destroy windows, clean up—is essential for writing correct MiniLibX programs.

**Important notes:**
- All window functions require a valid `mlx_ptr` returned by `mlx_init()`. If `mlx_init()` fails (returns `NULL`), no window operations can proceed.
- The origin `(0,0)` is the top‑left corner; the y‑axis increases downward.
- When a window is destroyed, any event hooks attached to it become invalid. Destroy windows before calling `mlx_destroy_display()` and exiting.
- The library is **not thread‑safe**; all calls should be made from the main thread.
- On X11, window creation may fail due to server restrictions (e.g., resource limits). Always check that `mlx_new_window()` returns a non‑NULL pointer.
- `mlx_clear_window()` will flush the display only if `mlx_init()` was configured to flush automatically (default behavior may vary).
- The `title` string is not copied internally; ensure it remains valid until the window is mapped.

## mlx_new_window

Creates a new X11 window with the specified dimensions and title. The window is immediately mapped (shown) on the display. The function waits for the first Expose event before returning, guaranteeing the window is ready for drawing.

**Internal details:** The window is created with a black background (`background_pixel = 0`) and a white border (border_pixel = -1, which on TrueColor visuals is white). It subscribes to all events (mask `0xFFFFFF`). Memory for the window’s internal structure is allocated and linked into the display’s window list. A graphics context (GC) with `GXcopy` function and full plane mask is created for future drawing operations.

**Window manager integration:** The function sets `WM_DELETE_WINDOW` protocol, allowing the application to receive a `ClientMessage` when the user clicks the close button. The window’s minimum and maximum sizes are locked to the initial size, preventing resizing.

**Signature:** `void *mlx_new_window(void *mlx_ptr, int size_x, int size_y, char *title)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `size_x` (int): Width of the window in pixels.
- `size_y` (int): Height of the window in pixels.
- `title` (char *): String to display in the window’s title bar.

**Returns:** Returns a non‑NULL pointer (window identifier) on success, or NULL on failure (e.g., memory allocation error, X server error).

**Example:**
```c
```c
#include "mlx.h"

int main(void) {
    void *mlx;
    void *win;

    mlx = mlx_init();
    if (!mlx) return (1);

    win = mlx_new_window(mlx, 800, 600, "Hello MiniLibX");
    if (!win) return (1);

    // ... drawing, event handling ...

    mlx_destroy_window(mlx, win);
    mlx_destroy_display(mlx);
    return (0);
}
```
```

## mlx_clear_window

Clears the entire window area by filling it with black (color value 0). Internally uses `XClearWindow()` which paints the window with its background pixel (set to black during creation). If the display was configured to flush automatically (`xvar->do_flush` true), an `XFlush()` is performed to ensure the clear is sent to the X server.

**Signature:** `int mlx_clear_window(void *mlx_ptr, void *win_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `win_ptr` (void *): The window identifier returned by mlx_new_window().

**Returns:** Returns 0 on success. (The underlying XClearWindow always succeeds; no error checking is performed.)

**Example:**
```c
```c
void *mlx = mlx_init();
void *win = mlx_new_window(mlx, 400, 300, "Clear Example");
// Draw something...
mlx_clear_window(mlx, win);  // Resets the window to black
```
```

## mlx_destroy_window

Destroys the specified window and releases all associated resources. The function:
1. Unlinks the window from the display’s internal window list.
2. Calls `XDestroyWindow()` to remove the X11 window.
3. Frees the graphics context (GC) with `XFreeGC()`.
4. Calls `free()` on the internal window structure.
5. Flushes the display if automatic flushing is enabled.

After this call, the `win_ptr` becomes invalid and must not be used again.

**Signature:** `int mlx_destroy_window(void *mlx_ptr, void *win_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `win_ptr` (void *): The window identifier to destroy.

**Returns:** Returns 0 on success. (No error is returned if the window is invalid; the function assumes a valid pointer.)

**Example:**
```c
```c
void *mlx = mlx_init();
void *win = mlx_new_window(mlx, 640, 480, "Temporary");
// ... use window ...
mlx_destroy_window(mlx, win);
// win is now invalid. Continue with other windows or clean up.
```
```

## Notes

- Always check that `mlx_new_window()` returns non‑NULL before using the window pointer.
- Destroy windows before calling `mlx_destroy_display()` or exiting the program.
- The order of destruction matters: destroy all windows and images, then call `mlx_destroy_display()`.
- Do not rely on the return value of `mlx_clear_window()` or `mlx_destroy_window()` – they are not specified to fail gracefully.
- The window title is not copied internally; the string pointed to by `title` must remain valid at least until the window is mapped (i.e., the function returns).
- The library is single‑threaded. Do not call MiniLibX functions from multiple threads.
- On some X11 servers, creating a window with `size_x` or `size_y` of 0 may cause undefined behavior.