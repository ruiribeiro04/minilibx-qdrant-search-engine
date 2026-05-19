# MiniLibX Sync and Display Module Reference

The sync and display module provides a small set of functions for managing the X11 display connection, synchronizing drawing commands, reading screen dimensions, and cleaning up the display context. These utilities form the final piece of the MiniLibX lifecycle: after creating windows and images and processing events, an application should call these functions to ensure all pending drawing operations are sent to the X server, and to release the display connection when done.

**Key responsibilities:**
- **Display synchronization** – `mlx_do_sync()` forces the X server to process all buffered requests, guaranteeing that previous drawing operations are visible.
- **Screen geometry** – `mlx_get_screen_size()` retrieves the physical dimensions of the root window (the entire screen).
- **Display destruction** – `mlx_destroy_display()` closes the X display connection and must be called after all windows and images are destroyed, before the program exits.
- **Helper function** – `mlx_int_get_visual()` is an internal routine that selects an appropriate TrueColor visual, creating a private colormap if necessary.

**Thread safety:** MiniLibX is **not thread-safe**; all calls should be made from the same thread that called `mlx_init()`. The X11 library itself is not thread‑safe by default, and MiniLibX does not add any locking.

**Platform-specific behavior:** These functions rely on the X11 libraries (`libX11`, `libXext`). On systems without an X server (e.g., pure Wayland or macOS), MiniLibX is not available or requires a compatible backend.

**Common pitfalls:**
- Forgetting to call `mlx_destroy_display()` after destroying windows leads to resource leaks.
- Calling `mlx_get_screen_size()` before `mlx_init()` is invalid; the `mlx_ptr` must be a valid connection identifier.
- `mlx_do_sync()` is rarely needed in typical event‑driven programs because the X server flushes automatically on event waits (`mlx_loop`), but it can be useful for immediate consistency after a batch of drawing calls.

## mlx_do_sync

Forces the X server to process all pending drawing requests (pixel puts, image puts, etc.) for the display associated with `mlx_ptr`. This ensures that any buffered output is actually visible on the screen. Normally, the X server flushes automatically when the application waits for events inside `mlx_loop()`, but this function can be used to guarantee visibility before a long computation or before reading back pixel data.

**Signature:** `int mlx_do_sync(void *mlx_ptr);`

**Parameters:**
- `mlx_ptr` (void *): The display connection identifier returned by `mlx_init()`.

**Returns:** Returns 0 on success (and a negative value on failure in some implementations).

**Example:**
```c
void *mlx = mlx_init();
void *win = mlx_new_window(mlx, 400, 300, "Sync Demo");
mlx_pixel_put(mlx, win, 100, 100, 0xFF0000);
mlx_do_sync(mlx);  // Ensure the pixel is visible immediately
```

## mlx_get_screen_size

Retrieves the width and height (in pixels) of the root window of the connected X display (i.e., the entire screen). The values are stored in the integers pointed to by `sizex` and `sizey`. This is useful for centering new windows or for determining the maximum available drawing area.

**Signature:** `int mlx_get_screen_size(void *mlx_ptr, int *sizex, int *sizey);`

**Parameters:**
- `mlx_ptr` (void *): The display connection identifier returned by `mlx_init()`.
- `sizex` (int *): Pointer to an integer that will receive the screen width in pixels.
- `sizey` (int *): Pointer to an integer that will receive the screen height in pixels.

**Returns:** Returns 0 on success, or a negative value on failure (e.g., if `mlx_ptr` is invalid).

**Example:**
```c
void *mlx = mlx_init();
int width, height;
mlx_get_screen_size(mlx, &width, &height);
printf("Screen: %dx%d\n", width, height);
```

## mlx_destroy_display

Closes the X11 display connection that was opened by `mlx_init()`. This must be called **after** all windows and images have been destroyed with `mlx_destroy_window()` and `mlx_destroy_image()`. Failure to call this function will leak X server resources. After calling this function, `mlx_ptr` becomes invalid and must not be used again.

**Signature:** `int mlx_destroy_display(void *mlx_ptr);`

**Parameters:**
- `mlx_ptr` (void *): The display connection identifier returned by `mlx_init()`.

**Returns:** Returns 0 on success. (Internally it calls `XCloseDisplay`, which returns 0 on success or a negative value on error.)

**Example:**
```c
void *mlx = mlx_init();
// ... create windows, run loop ...
// After loop ends:
// mlx_destroy_window(mlx, win);
mlx_destroy_display(mlx);
```

## mlx_int_get_visual

Internal function used by MiniLibX during initialization to select an appropriate X11 visual. It checks whether the default visual supports TrueColor (direct RGB). If yes, it uses it directly. Otherwise, it searches for a TrueColor visual that matches the current display depth. If such a visual is found, it sets `xvar->private_cmap` to 1 and stores the visual in `xvar->visual`. This function is called automatically by `mlx_init()` and should not be called by user code.

**Signature:** `int mlx_int_get_visual(t_xvar *xvar);`

**Parameters:**
- `xvar` (t_xvar *): Pointer to the internal MiniLibX connection struct (`t_xvar`), which contains the display, screen, current visual, and other state. This struct is opaque to the user.

**Returns:** Returns 0 on success (TrueColor visual obtained), -1 on failure (no suitable TrueColor visual found).

**Example:**
```c
// Not intended for direct use.
// Called internally: mlx_int_get_visual(&(mlx_ptr->xvar));
```

## Notes

- **Lifecycle order:** The typical cleanup sequence is: destroy all images → destroy all windows → `mlx_destroy_display()` → program exit.
- `mlx_do_sync()` is equivalent to calling `XSync()` on the underlying X11 connection. It will block until the server finishes processing all buffered requests, which can have a performance impact if called excessively.
- `mlx_get_screen_size()` returns the size of the **root window** (the entire screen), not the available work area. On some multi-monitor setups, this may be the combined size of all monitors, or the size of the primary monitor, depending on the X server configuration.
- The `t_xvar` type used by `mlx_int_get_visual()` is defined in the private header `mlx_int.h` and is not part of the public API. Users should never need to access it directly.