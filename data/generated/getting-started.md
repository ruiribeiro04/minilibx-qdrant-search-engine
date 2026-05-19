# MiniLibX Getting Started Module

The **getting-started** module of MiniLibX provides the fundamental functions required to initialize the library, create windows, draw basic pixels and strings, and enter the event loop. These functions form the minimal core needed to display a window and receive user input.

**Typical Workflow**
1. Call `mlx_init()` to establish a connection to the X11 display server. This must be done before any other MiniLibX call.
2. Create one or more windows with `mlx_new_window()`. Each window is identified by a `void*` handle.
3. Optionally draw pixels or strings directly to the window using `mlx_pixel_put()` and `mlx_string_put()`. Note that drawing individual pixels is slow and suitable only for small test programs; for efficient rendering, use images (`mlx_new_image` and related functions described in other modules).
4. Register event hooks (keyboard, mouse, expose) with `mlx_key_hook()`, `mlx_mouse_hook()`, `mlx_expose_hook()`, or the generic `mlx_hook()`.
5. Enter the main event loop with `mlx_loop()`. This function never returns and processes events until the program is terminated.

**Common Pitfalls**
- Always check the return value of `mlx_init()` — a `NULL` pointer indicates failure (e.g., no X server available).
- Pixel coordinates (0,0) are the **top‑left** corner; y increases downward.
- The `color` parameter for drawing functions uses format `0x00RRGGBB` (one byte each for red, green, blue in that order).
- Direct pixel drawing (`mlx_pixel_put`) is not meant for real‑time rendering; use images and `mlx_put_image_to_window` for better performance.
- The event loop (`mlx_loop`) is blocking and will keep the program running until the window is closed or the process is killed.

**Thread Safety**
MiniLibX is **not** thread‑safe. All calls should be made from the same thread, typically the main thread.

**Platform‑Specific Behavior**
MiniLibX is built on X11 and runs only on Unix‑like systems with an X server (Linux, macOS with XQuartz, etc.). The library is linked with `-lmlx -lXext -lX11`. On systems without an X server, `mlx_init()` returns `NULL`.

## mlx_init

Initializes the connection between your program and the X11 display server. This function must be called before any other MiniLibX function. It allocates and returns an opaque pointer that represents the display connection (the `mlx_ptr` required by almost all other functions).

**Signature:** `void *mlx_init(void)`

**Parameters:**
- `none` (-): This function takes no parameters.

**Returns:** Returns a non‑NULL pointer (the connection identifier) on success. Returns `NULL` if the connection to the display server cannot be established (e.g., no X server is running or the DISPLAY environment variable is not set correctly).

**Example:**
```c
```c
#include <mlx.h>

int main(void)
{
    void *mlx;

    mlx = mlx_init();
    if (!mlx)
        return (1);
    // ... rest of the program ...
    return (0);
}
```
```

## mlx_new_window

Creates a new window on the screen with the specified width, height, and title text. The window is initially filled with black. Returns an opaque window identifier that is used by other window‑related functions.

**Signature:** `void *mlx_new_window(void *mlx_ptr, int size_x, int size_y, char *title)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `size_x` (int): Width of the window in pixels.
- `size_y` (int): Height of the window in pixels.
- `title` (char *): String to be displayed in the window's title bar.

**Returns:** Returns a non‑NULL window identifier on success. Returns `NULL` if the window could not be created (e.g., out of memory or X server resources).

**Example:**
```c
```c
void *mlx;
void *win;

mlx = mlx_init();
if (!mlx)
    exit(1);
win = mlx_new_window(mlx, 800, 600, "My Window");
if (!win)
    exit(1);
```
```

## mlx_clear_window

Clears the entire window area by filling it with black.

**Signature:** `int mlx_clear_window(void *mlx_ptr, void *win_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()`.

**Returns:** Currently returns an undefined value (the implementation likely returns 0 or 1, but users should not rely on it).

**Example:**
```c
```c
mlx_clear_window(mlx, win);
```
```

## mlx_pixel_put

Draws a single pixel at the given coordinates in the specified window. The coordinate system has (0,0) at the top‑left corner; x increases to the right, y increases downward. The color is encoded as `0x00RRGGBB` (8 bits per component, where RR=red, GG=green, BB=blue).

**Performance note:** This function sends a request to the X server for every pixel. For drawing multiple pixels, use images (`mlx_new_image`) for much better performance.

**Signature:** `int mlx_pixel_put(void *mlx_ptr, void *win_ptr, int x, int y, int color)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()`.
- `x` (int): Horizontal coordinate (0 = left edge).
- `y` (int): Vertical coordinate (0 = top edge).
- `color` (int): Color value in `0x00RRGGBB` format.

**Returns:** Returns an undefined integer (the implementation usually returns 0).

**Example:**
```c
```c
// Draw a red pixel at (100, 200)
mlx_pixel_put(mlx, win, 100, 200, 0x00FF0000);
```
```

## mlx_string_put

Draws a null‑terminated string at the given coordinates in the window. The text is rendered using the default system font. The coordinate (x, y) defines the position of the first character (top‑left corner of the text). Color follows the same `0x00RRGGBB` encoding as `mlx_pixel_put`.

**Signature:** `int mlx_string_put(void *mlx_ptr, void *win_ptr, int x, int y, int color, char *string)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier returned by `mlx_new_window()`.
- `x` (int): X coordinate of the text start.
- `y` (int): Y coordinate of the text start.
- `color` (int): Color of the text in `0x00RRGGBB` format.
- `string` (char *): The text string to display (null‑terminated).

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
mlx_string_put(mlx, win, 50, 50, 0x00FFFFFF, "Hello, MiniLibX!");
```
```

## mlx_loop

Enters the main event processing loop. This function never returns; it continuously waits for events (keyboard, mouse, expose, etc.) and calls the registered hook functions accordingly. The program will run until the window is closed, `mlx_loop_end()` is called (if supported), or the process receives a termination signal.

**Signature:** `int mlx_loop(void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.

**Returns:** This function never returns normally, so no meaningful return value is defined. On some implementations it may return an integer after `mlx_loop_end()` is triggered.

**Example:**
```c
```c
int handle_key(int keycode, void *param)
{
    if (keycode == 65307) // ESC key
        exit(0);
    return (0);
}

int main(void)
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "Test");

    mlx_key_hook(win, handle_key, NULL);
    mlx_loop(mlx);  // never returns
    return (0);
}
```
```

## mlx_key_hook

Registers a callback function that will be called whenever a keyboard key is pressed while the specified window has focus. The callback receives the keycode (from X11 `keysymdef.h`) and the user‑supplied `param` pointer.

**Signature:** `int mlx_key_hook(void *win_ptr, int (*funct_ptr)(int keycode, void *param), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier for which the hook is being set.
- `funct_ptr` (int (*)(int keycode, void *param)): Pointer to the callback function. The function should return an integer (the return value is currently ignored by MiniLibX).
- `param` (void *): User‑defined parameter that will be passed unchanged to the callback every time it is invoked.

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
int key_press(int keycode, void *param)
{
    if (keycode == 65307) // ESC key
        exit(0);
    return (0);
}

mlx_key_hook(win, key_press, NULL);
```
```

## mlx_mouse_hook

Registers a callback function that will be called whenever a mouse button is pressed while the cursor is inside the specified window. The callback receives the button number (1=left, 2=middle, 3=right, etc.), the (x, y) coordinates of the click relative to the window's top‑left corner, and the user‑supplied `param` pointer.

**Signature:** `int mlx_mouse_hook(void *win_ptr, int (*funct_ptr)(int button, int x, int y, void *param), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier for which the hook is being set.
- `funct_ptr` (int (*)(int button, int x, int y, void *param)): Pointer to the callback function.
- `param` (void *): User‑defined parameter passed to the callback.

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
int mouse_click(int button, int x, int y, void *param)
{
    printf("Mouse button %d clicked at (%d, %d)\n", button, x, y);
    return (0);
}

mlx_mouse_hook(win, mouse_click, NULL);
```
```

## mlx_expose_hook

Registers a callback function that will be called when a part of the window needs to be redrawn (expose event). This happens when the window is first shown, or after it is uncovered from behind another window. The callback receives only the user‑supplied `param` pointer.

**Signature:** `int mlx_expose_hook(void *win_ptr, int (*funct_ptr)(void *), void *param)`

**Parameters:**
- `win_ptr` (void *): The window identifier for which the hook is being set.
- `funct_ptr` (int (*)(void *)): Pointer to the callback function.
- `param` (void *): User‑defined parameter passed to the callback.

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
int expose(void *param)
{
    mlx_clear_window(mlx, win);
    // redraw content here
    return (0);
}

mlx_expose_hook(win, expose, NULL);
```
```

## mlx_destroy_window

Destroys the specified window, freeing its resources. After this call, the window identifier is no longer valid.

**Signature:** `int mlx_destroy_window(void *mlx_ptr, void *win_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.
- `win_ptr` (void *): The window identifier to destroy.

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
mlx_destroy_window(mlx, win);
```
```

## mlx_destroy_display

Closes the connection to the X display server and frees all resources associated with the connection. After this call, the `mlx_ptr` is invalid and cannot be used again.

**Signature:** `int mlx_destroy_display(void *mlx_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by `mlx_init()`.

**Returns:** Returns an undefined integer (implementation‑specific).

**Example:**
```c
```c
mlx_destroy_display(mlx);
free(mlx);  // mlx pointer must be freed by user after destroy_display
```
```

## Notes

- The `mlx_loop` function never returns; ensure all cleanup is handled in hook callbacks or before calling `mlx_loop`.
- Direct pixel drawing (`mlx_pixel_put`) is extremely slow for more than a few hundred pixels. Always use the image API (`mlx_new_image`, `mlx_put_image_to_window`) for actual rendering.
- Window coordinates start at (0,0) top‑left, with positive x right and positive y down.
- The color format `0x00RRGGBB` is always little‑endian in terms of byte order (blue in the least significant byte). On big‑endian systems, the value may need to be converted; `mlx_get_color_value()` helps with images.
- The keycode values correspond to X11 keysyms; common codes: ESC = 65307, W = 119, A = 97, S = 115, D = 100. For a full list, include `<X11/keysymdef.h>`.
- The library is not thread‑safe; all calls must be from the main thread.
- On macOS with XQuartz, ensure the X server is running before executing the program.