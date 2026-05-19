# MiniLibX Mouse Module Documentation

This module provides mouse-related functionality for MiniLibX, enabling you to capture mouse button presses, query the current mouse position, and control mouse visibility and movement within a window. It sits on top of the X11 protocol, translating low-level pointer events and state into easy-to-use function calls. The functions work together to give full control over mouse interaction in your graphical application.

## mlx_mouse_hook

Registers a callback function that is called whenever a mouse button is pressed inside the specified window. The callback receives the button number (1=left, 2=middle, 3=right, etc.), the x/y coordinates of the click relative to the window origin (top-left), and the user-defined `param` pointer. Only one mouse hook can be active per window at a time; calling this function again replaces the previous hook.

**Signature:** `int mlx_mouse_hook(void *win_ptr, int (*funct_ptr)(int button, int x, int y, void *param), void *param);`

**Parameters:**
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()` on which to listen for mouse button events.
- `funct_ptr` (int (*)(int button, int x, int y, void *param)): Pointer to the user-defined callback function. It should return an integer (the return value is currently ignored by MiniLibX).
- `param` (void *): Arbitrary pointer that will be passed unchanged to the callback each time it is invoked. Typically points to a structure containing application state.

**Returns:** Returns 0 on success. No error checking is performed.

**Example:**
```c
```c
typedef struct s_data {
    void *mlx;
    void *win;
} t_data;

int mouse_press(int button, int x, int y, void *param)
{
    t_data *data = (t_data *)param;
    printf("Button %d pressed at (%d, %d)\n", button, x, y);
    return 0;
}

int main()
{
    t_data data;
    data.mlx = mlx_init();
    data.win = mlx_new_window(data.mlx, 800, 600, "Mouse Hook Example");
    mlx_mouse_hook(data.win, mouse_press, &data);
    mlx_loop(data.mlx);
    return 0;
}
```
```

## mlx_mouse_get_pos

Queries the current position of the mouse pointer relative to the specified window's origin (top-left corner). The coordinates are written into the integers pointed to by `x` and `y`. If the pointer is not on the same screen as the window (e.g., it is on another display or outside all windows), both `x` and `y` are set to 0 and the function returns 0.

**Signature:** `int mlx_mouse_get_pos(void *mlx_ptr, void *win_ptr, int *x, int *y);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()`.
- `x` (int *): Pointer to an integer that will receive the mouse's x-coordinate (in pixels) relative to the window.
- `y` (int *): Pointer to an integer that will receive the mouse's y-coordinate (in pixels) relative to the window.

**Returns:** Nonzero if the pointer is on the same screen as the window, zero otherwise. When zero is returned, `*x` and `*y` are set to 0.

**Example:**
```c
```c
int x, y;
if (mlx_mouse_get_pos(mlx, win, &x, &y))
    printf("Mouse is at (%d, %d) in window\n", x, y);
else
    printf("Mouse is not on this window's screen\n");
```
```

## mlx_mouse_move

Warps (moves) the mouse pointer to the specified coordinates `(x, y)` relative to the origin of the given window. The pointer is moved instantly; no animation is performed. This function can be used to implement custom cursor control or pointer locking.

**Signature:** `int mlx_mouse_move(void *mlx_ptr, void *win_ptr, int x, int y);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier relative to which the coordinates are interpreted.
- `x` (int): Target x-coordinate (in pixels) inside the window.
- `y` (int): Target y-coordinate (in pixels) inside the window.

**Returns:** Always returns 0.

**Example:**
```c
```c
// Move the mouse to the center of the window (400, 300)
mlx_mouse_move(mlx, win, 400, 300);
```
```

## mlx_mouse_hide

Hides the mouse cursor when it is inside the specified window. The cursor becomes invisible but still functions normally (clicks are still detected, position can still be queried). The cursor is replaced with an invisible 1×1 pixmap cursor. This is useful for applications that implement their own custom cursor or for full-screen games.

**Signature:** `int mlx_mouse_hide(void *mlx_ptr, void *win_ptr);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window in which the cursor should become invisible.

**Returns:** Returns 0. Note that the underlying implementation does not handle errors; calling this function on an invalid window may cause undefined behavior.

**Example:**
```c
```c
mlx_mouse_hide(mlx, win);  // cursor disappears while over the window
```
```

## mlx_mouse_show

Restores the default cursor for the specified window, reversing the effect of `mlx_mouse_hide()`. The cursor becomes visible again. Calling this function on a window that has not been hidden is harmless.

**Signature:** `int mlx_mouse_show(void *mlx_ptr, void *win_ptr);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window whose cursor should be restored.

**Returns:** Always returns 0.

**Example:**
```c
```c
mlx_mouse_show(mlx, win);  // cursor becomes visible again
```
```

## Notes

- The mouse position query (`mlx_mouse_get_pos`) returns coordinates relative to the window's content area, excluding window decorations and title bar. Coordinates are in pixels with origin at the top-left corner; x increases to the right, y increases downward.
- The `mlx_mouse_hook` callback only fires on button presses, not releases. For more fine-grained event handling (including motion, release, or enter/leave), use the generic `mlx_hook()` function with X11 event constants.
- `mlx_mouse_move` uses XWarpPointer, which respects pointer constraints. On some window managers or configurations, the move may be subject to pointer barriers or may not be instantaneous if the pointer is grabbed by another application.
- `mlx_mouse_hide` and `mlx_mouse_show` only affect the cursor appearance within the specified window; they do not grab or confine the pointer. For full pointer confinement, you need to use X11 calls via `mlx_hook()` or direct X11 functions.
- None of these mouse functions are thread-safe. They should be called only from the main thread, typically within the event loop or during initialization.
- All functions expect valid `mlx_ptr` and `win_ptr` pointers obtained from successful calls to `mlx_init()` and `mlx_new_window()`, respectively. Passing invalid pointers leads to undefined behavior (likely a crash).
- On macOS (using the AppKit backend) these functions may behave differently or be unavailable; MiniLibX on macOS provides event handling through `mlx_hook` only.