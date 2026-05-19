# MiniLibX Events Module Documentation

The MiniLibX events module provides a mechanism for graphical programs to respond to user input and window system notifications. It is built on top of the X11 event system and offers both high-level convenience hooks and a low-level generic hook.

The core of the system is `mlx_loop()`, an infinite event-processing loop that never returns. Before entering this loop, the program registers callback functions (hooks) for specific events using `mlx_key_hook()` (key presses), `mlx_mouse_hook()` (mouse button presses), `mlx_expose_hook()` (window exposure/redraw requests), and `mlx_loop_hook()` (a function called when no other events are pending). Each hook is associated with a particular window (`win_ptr`) and receives a user-supplied `param` pointer.

For advanced use, `mlx_hook()` gives direct access to any X11 event type by specifying the event number and a corresponding mask. This allows handling events like button releases, motion notify, or any other X event.

The internal implementation (seen in the source files) stores hook function pointers and masks in an array inside the window structure (`t_win_list`). When an X event arrives, the dispatcher in `mlx_int_param_event.c` calls the appropriate callback with the correct parameters (keycode, mouse coordinates, button number, etc.).

**Common pitfalls:**
- The program structure is inversion-of-control: you set up hooks, then call `mlx_loop()` which blocks indefinitely. Any code after `mlx_loop()` will not execute until the loop ends (e.g., via `mlx_loop_end()`).
- Keycodes are raw X11 keycodes (or Keysym values depending on the version). Use `/usr/include/X11/keysymdef.h` for symbolic names.
- The `param` pointer is passed unchanged to your callbacks; it is your responsibility to manage its memory and cast it appropriately.
- The `mlx_loop_hook()` is called repeatedly when the event queue is empty; it is often used for animation or continuous redrawing.

**Thread safety:** The MiniLibX library is **not thread-safe**. All calls should be made from the same thread that calls `mlx_loop()`.

**Platform-specific behavior:** For X11 systems, the event values and masks correspond to X11 constants (see `X.h`). On other platforms (like macOS with a bundled MiniLibX), the event numbers may differ.

## mlx_loop

Enters the main event-processing loop for the MiniLibX application. This function never returns under normal operation. It blocks waiting for X events and dispatches them to the registered hook functions. The loop can be terminated by calling `mlx_loop_end()` from within a callback or hook.

**Signature:** `int mlx_loop (void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.

**Returns:** On termination via `mlx_loop_end()`, returns 0. Otherwise it does not return.

**Example:**
```c
```c
void my_loop_hook(void *param)
{
    // continuous redraw or animation
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "Events Demo");
    mlx_loop_hook(mlx, my_loop_hook, NULL);
    mlx_loop(mlx);  // never returns
    return 0;
}
```
```

## mlx_loop_hook

Registers a function that is called repeatedly when the event queue is empty. This is useful for animations, gameplay loops, or continuous updates. The function is called with no event-specific arguments, only the user-supplied `param`. It is called after all pending events have been processed.

**Signature:** `int mlx_loop_hook (void *mlx_ptr, int (*funct_ptr)(), void *param)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `funct_ptr` (int (*)()): Pointer to the callback function. It will be called as `funct_ptr(param)`.
- `param` (void *): A user-defined pointer passed to the callback each time it is invoked.

**Returns:** Typically returns 0 on success.

**Example:**
```c
```c
int frame_update(void *param)
{
    // redraw scene
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    mlx_loop_hook(mlx, frame_update, NULL);
    mlx_loop(mlx);
    return 0;
}
```
```

## mlx_key_hook

Registers a callback for key release events in the specified window. When a key is released, the callback is invoked with the X11 keysym (or keycode) and the user parameter. Note: By default, this hook is for **KeyRelease** events (not KeyPress). This is a high-level convenience wrapper.

**Signature:** `int mlx_key_hook (void *win_ptr, int (*funct_ptr)(int keycode, void *param), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()`.
- `funct_ptr` (int (*)(int keycode, void *param)): Pointer to the callback function. `keycode` is the X11 key symbol (e.g., XK_Escape, XK_A).
- `param` (void *): A user-defined pointer passed to the callback.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
int handle_key(int keycode, void *param)
{
    if (keycode == 65307) // XK_Escape
        mlx_loop_end(((void **)param)[0]);
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 640, 480, "key test");
    mlx_key_hook(win, handle_key, &mlx);
    mlx_loop(mlx);
    return 0;
}
```
```

## mlx_mouse_hook

Registers a callback for mouse button press events in the specified window. When a mouse button is pressed, the callback receives the button number (1=left, 2=middle, 3=right, etc.), the mouse coordinates relative to the window, and the user parameter.

**Signature:** `int mlx_mouse_hook (void *win_ptr, int (*funct_ptr)(int button, int x, int y, void *param), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier.
- `funct_ptr` (int (*)(int button, int x, int y, void *param)): Pointer to the callback function.
- `param` (void *): A user-defined pointer passed to the callback.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
int mouse_click(int button, int x, int y, void *param)
{
    printf("Mouse button %d at (%d,%d)\n", button, x, y);
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 640, 480, "mouse test");
    mlx_mouse_hook(win, mouse_click, NULL);
    mlx_loop(mlx);
    return 0;
}
```
```

## mlx_expose_hook

Registers a callback for window expose events. When a part of the window needs to be redrawn (e.g., after being uncovered), the callback is invoked. This is your program's responsibility to redraw the window content. The callback is called only once per expose event series (when count reaches zero).

**Signature:** `int mlx_expose_hook (void *win_ptr, int (*funct_ptr)(void *param), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier.
- `funct_ptr` (int (*)(void *param)): Pointer to the callback function. It receives only the user parameter.
- `param` (void *): A user-defined pointer passed to the callback.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
int expose_redraw(void *param)
{
    void **ctx = (void **)param;
    // redraw everything using mlx_put_image_to_window
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 640, 480, "expose test");
    void *ctx[2] = {mlx, win};
    mlx_expose_hook(win, expose_redraw, ctx);
    mlx_loop(mlx);
    return 0;
}
```
```

## mlx_hook

Low-level generic hook for any X11 event. Allows you to register a callback for any X event type, such as ButtonRelease, MotionNotify, KeyPress, or client messages. The event type and mask are X11 constants (e.g., 4 for ButtonPress, ButtonPressMask). The callback function signature depends on the event; for example, a MotionNotify callback receives `(int x, int y, void *param)`. This is more flexible but requires knowledge of X11 internals.

**Signature:** `int mlx_hook (void *win_ptr, int x_event, int x_mask, int (*funct)(), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier.
- `x_event` (int): The X11 event type number (e.g., 6 for MotionNotify, 5 for ButtonRelease).
- `x_mask` (int): The X11 event mask (e.g., ButtonReleaseMask, PointerMotionMask). Used to tell the X server which events to deliver.
- `funct` (int (*)()): Pointer to the callback function. The actual signature depends on the event type (see source mlx_int_param_event.c).
- `param` (void *): A user-defined pointer passed to the callback.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
int motion_handler(int x, int y, void *param)
{
    printf("Mouse moved to (%d,%d)\n", x, y);
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 640, 480, "motion test");
    // Event 6 = MotionNotify, mask 0x40 = PointerMotionMask
    mlx_hook(win, 6, (1L<<6), motion_handler, NULL);
    mlx_loop(mlx);
    return 0;
}
```
```

## mlx_loop_end

Terminates the event loop started by `mlx_loop()`. When called from within a hook or callback, it causes `mlx_loop()` to return. After this call, program execution continues after the `mlx_loop()` call.

**Signature:** `int mlx_loop_end (void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
int key_escape(int keycode, void *mlx)
{
    if (keycode == 65307) // Escape
        mlx_loop_end(mlx);
    return 0;
}

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 640, 480, "end loop");
    mlx_key_hook(win, key_escape, mlx);
    mlx_loop(mlx);
    printf("Loop ended\n");
    return 0;
}
```
```

## mlx_do_key_autorepeatoff

Disables the keyboard autorepeat feature. When called, holding down a key will not generate repeated KeyPress events; only one event per press is sent.

**Signature:** `int mlx_do_key_autorepeatoff (void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
void disable_repeat(void)
{
    mlx_do_key_autorepeatoff(mlx);
}
```
```

## mlx_do_key_autorepeaton

Re-enables the keyboard autorepeat feature after it has been disabled.

**Signature:** `int mlx_do_key_autorepeaton (void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
void enable_repeat(void)
{
    mlx_do_key_autorepeaton(mlx);
}
```
```

## mlx_do_sync

Forces a synchronization with the X server. This function blocks until the X server has processed all pending requests. Can be used to ensure that all drawing commands have been executed before proceeding.

**Signature:** `int mlx_do_sync (void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.

**Returns:** Returns 0 on success.

**Example:**
```c
```c
void flush_commands(void)
{
    mlx_do_sync(mlx);
}
```
```

## Notes

- The `mlx_loop()` function never returns unless `mlx_loop_end()` is called from within a hook. Be careful not to place cleanup code immediately after `mlx_loop()` without a termination path.
- The high-level hooks (`mlx_key_hook`, `mlx_mouse_hook`, `mlx_expose_hook`) are convenience wrappers that set the mask and event type for the most common events. They call `mlx_hook()` internally with the appropriate X11 constants.
- Keycodes: The value passed to the key hook is the X11 keysym (e.g., 0xff1b for Escape). You can use the X11 `keysymdef.h` macros for readability.
- Mouse buttons: Button numbers are 1 (left), 2 (middle), 3 (right), 4 (scroll up), 5 (scroll down) on most systems.
- Event masks: When using `mlx_hook()`, you must provide both an event type and a mask. The mask should be the corresponding bit for that event (e.g., ButtonPressMask = 0x4 for ButtonPress event 4).
- The `mlx_loop_hook()` is not a true idle hook; it is called after processing all pending events. It can be called very frequently, so ensure the callback returns quickly to avoid blocking event processing.
- Destroying a window with `mlx_destroy_window()` while inside a hook for that window may cause undefined behavior.
- Thread safety: The MiniLibX library is not thread-safe. All event-related calls must occur from the same thread that calls `mlx_loop()`.