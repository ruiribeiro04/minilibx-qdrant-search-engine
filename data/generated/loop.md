# MiniLibX Loop Module Documentation

The **loop** module is the core event-driven engine of MiniLibX. It provides an infinite event processing loop and a mechanism to register idle-time callbacks. The module is built around three functions:

1.  **`mlx_loop()`**: Enters an infinite loop that waits for and dispatches X‑Window system events (key presses, mouse clicks, window expose, etc.) to user-defined hook functions. It also calls the optional `mlx_loop_hook` function when no events are pending. The loop terminates when all windows are closed or when `mlx_loop_end()` is called.

2.  **`mlx_loop_hook()`**: Registers a user function that is called repeatedly when the event queue is empty. Useful for animation or continuous rendering.

3.  **`mlx_loop_end()`**: Sets an internal flag that causes `mlx_loop()` to exit gracefully at the next opportunity.

These three functions work together to give the user full control over the application’s main loop: `mlx_loop_hook` provides a frame‑like callback for real‑time updates, `mlx_loop_end` offers a clean way to break out of the loop, and `mlx_loop` ties everything together.

## mlx_loop

Starts the main event‑processing loop. It never returns under normal operation – it continuously waits for X events (keyboard, mouse, expose, etc.) and dispatches them to the appropriate user‑registered hooks. If a `mlx_loop_hook` has been set, it is called whenever the event queue is empty.

The loop automatically stops when:
- All windows created with `mlx_new_window()` have been destroyed.
- `mlx_loop_end()` has been called (sets the internal `end_loop` flag).

Once the loop terminates, `mlx_loop()` returns `0`.

**Signature:** ````c
int mlx_loop(void *mlx_ptr);
````

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`. Must not be NULL.

**Returns:** `int` – always returns `0` after the loop exits.

**Example:**
```c
```c
#include "mlx.h"

int main(void)
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "My Window");
    // Register hooks here...
    mlx_loop(mlx);        // Enters infinite event loop
    return (0);
}
```
```

## mlx_loop_hook

Registers a callback function that is called repeatedly by `mlx_loop` whenever no events are pending in the X‑Window event queue. This is typically used for animation, continuous updates, or any periodic task.

Only one loop hook can be active at a time – calling `mlx_loop_hook` again replaces the previous one. The function receives the `param` pointer as its sole argument.

**Note:** If the event queue is never empty (e.g., continuous mouse motion), the loop hook may not be called. To ensure it runs, you can temporarily suppress events or use `mlx_do_sync()` to flush the queue.

**Signature:** ````c
int mlx_loop_hook(void *mlx_ptr, int (*funct_ptr)(), void *param);
````

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`. Must not be NULL.
- `funct_ptr` (int (*)()): Pointer to the user‑defined hook function. It will be called with one argument (the `param` pointer). It should return an `int` (the return value is currently ignored by MiniLibX). Typically defined as:
```c
int loop_hook(void *param);
```
- `param` (void *): Arbitrary user‑supplied pointer that is passed unchanged to `funct_ptr` each time it is called. Can be NULL.

**Returns:** `int` – always returns `0` (as of MiniLibX implementation).

**Example:**
```c
```c
#include "mlx.h"

typedef struct s_data {
    void *mlx;
    void *win;
    int   frame;
} t_data;

int render_loop(void *param)
{
    t_data *data = (t_data *)param;
    // Clear window, draw something, etc.
    data->frame++;
    return (0);
}

int main(void)
{
    t_data data;
    data.mlx = mlx_init();
    data.win = mlx_new_window(data.mlx, 400, 300, "Animation");
    data.frame = 0;
    mlx_loop_hook(data.mlx, render_loop, &data);
    mlx_loop(data.mlx);
    return (0);
}
```
```

## mlx_loop_end

Signals the main event loop (started by `mlx_loop()`) to terminate. It sets an internal flag (`end_loop`) that `mlx_loop()` checks after each event dispatch and before each loop hook call.

This function is typically called from a key or mouse hook to exit the application cleanly. After calling `mlx_loop_end`, the next iteration of `mlx_loop` will exit and return `0`.

**Signature:** ````c
int mlx_loop_end(void *mlx_ptr);
````

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`. Must not be NULL.

**Returns:** `int` – always returns `1` on success.

**Example:**
```c
```c
#include "mlx.h"

int key_hook(int keycode, void *param)
{
    void *mlx = (void *)param;
    if (keycode == 65307)  // Escape key
        mlx_loop_end(mlx);
    return (0);
}

int main(void)
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "Press ESC to exit");
    mlx_key_hook(win, key_hook, mlx);
    mlx_loop(mlx);
    return (0);
}
```
```

## Notes

- **Thread safety**: MiniLibX is **not** thread‑safe. All calls to the loop module functions should be made from the same thread that called `mlx_init()`. Simultaneous calls from multiple threads may cause undefined behavior.
- **Platform‑specific behavior**:
- On X11, `mlx_loop` uses `XNextEvent()` and `XPending()`. The loop hook is called after `XSync()` if the event queue is empty.
- On other backends (e.g., macOS Cocoa via MiniLibX‑XPM, Windows via custom implementations), the behavior may differ. The loop hook may be called at a fixed rate or tied to display refresh.
- `mlx_loop_end` is not native to all MiniLibX ports; it was added in later versions (around 2005). In older versions, the only way to exit the loop was to destroy all windows.
- **Pitfalls**:
- **Blocking behavior**: `mlx_loop` never returns until the termination condition is met. Do not place code after `mlx_loop` that you expect to run immediately.
- **Loop hook starvation**: If events arrive faster than they can be processed (e.g., mouse motion flood), the loop hook may never be called. Use `mlx_do_sync()` sparingly or throttle event generation.
- **Memory**: The loop does not automatically destroy windows or images. You must destroy them explicitly before or after calling `mlx_loop_end` to avoid resource leaks (especially on X11, where `mlx_destroy_display()` should be called after the loop ends).
- **Common usage pattern**:
1. Initialize MiniLibX with `mlx_init()`.
2. Create one or more windows with `mlx_new_window()`.
3. Register event hooks (key, mouse, expose) and optionally a loop hook.
4. Call `mlx_loop()` to start the event loop.
5. To exit, call `mlx_loop_end()` from a hook (e.g., pressing Escape), then clean up resources after the loop returns.