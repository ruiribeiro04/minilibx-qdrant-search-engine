# MiniLibX Drawing Module Documentation

The drawing module of MiniLibX provides the core functions for rendering graphics directly onto windows without using image buffers. It offers two main drawing operations: plotting individual pixels and displaying text strings. These functions operate on the window's drawable surface and use immediate mode rendering—each call sends a drawing command to the X server, which updates the display. The module also includes a font selection function to control the typeface used by `mlx_string_put`. Color management is handled via a 0x00RRGGBB hexadecimal format, where the least significant byte is blue. Functions are not thread-safe and are intended for single-threaded use within the main event loop (see `mlx_loop`). For performance-critical or frequent drawing, consider using the image module (`mlx_new_image`, `mlx_put_image_to_window`) instead, which allows off-screen buffering. Drawing coordinates are relative to the window's top-left corner, with x increasing rightward and y increasing downward. The module's behavior is platform-specific under X11; on macOS or other backends, implementation details may vary.

## mlx_pixel_put

Draws a single pixel at the specified coordinates in the given window. The pixel is drawn immediately and appears on screen after the X server processes the request. This function is suitable for sparse drawing operations; for bulk rendering, use image functions to avoid performance degradation.

**Signature:** `int mlx_pixel_put(void *mlx_ptr, void *win_ptr, int x, int y, int color)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `win_ptr` (void *): The window identifier returned by mlx_new_window() where the pixel will be drawn.
- `x` (int): The x-coordinate of the pixel. Origin (0,0) is at the top-left corner of the window. Must be within the window bounds; drawing outside the window has no effect.
- `y` (int): The y-coordinate of the pixel. Positive values increase downward. Must be within the window bounds.
- `color` (int): The color of the pixel encoded as 0x00RRGGBB, where RR, GG, BB are red, green, and blue components in the range 0x00–0xFF. The most significant byte is ignored.

**Returns:** Returns 0 on success. On error, the behavior is undefined (common implementations may return -1 or do nothing).

**Example:**
```c

#include <mlx.h>

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "Pixel Example");
    // Draw a red pixel at (100, 200)
    mlx_pixel_put(mlx, win, 100, 200, 0x00FF0000);
    mlx_loop(mlx);
    return 0;
}

```

## mlx_string_put

Draws a null-terminated ASCII string at the specified coordinates on the window. The baseline of the text is positioned at (x, y), meaning the bottom of most characters aligns with the y coordinate. The font used can be set with mlx_set_font(); by default, the X server's built-in font is used. Non-ASCII characters are not supported.

**Signature:** `int mlx_string_put(void *mlx_ptr, void *win_ptr, int x, int y, int color, char *string)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `win_ptr` (void *): The window identifier returned by mlx_new_window() where the text will be drawn.
- `x` (int): The x-coordinate of the text baseline (leftmost point). Origin (0,0) is at the top-left corner. The string will extend to the right of this coordinate.
- `y` (int): The y-coordinate of the text baseline. Characters such as 'g' or 'y' with descenders will extend below this line. Must be within window bounds to be visible.
- `color` (int): The text color encoded as 0x00RRGGBB. The same format as mlx_pixel_put.
- `string` (char *): A pointer to a null-terminated ASCII string to be displayed. Must not be NULL.

**Returns:** Returns 0 on success. On error, the behavior is implementation-defined.

**Example:**
```c

#include <mlx.h>

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 400, 300, "String Example");
    // Display "Hello, World!" at (50, 150) in white
    mlx_string_put(mlx, win, 50, 150, 0x00FFFFFF, "Hello, World!");
    mlx_loop(mlx);
    return 0;
}

```

## mlx_set_font

Sets the font used for subsequent calls to mlx_string_put on the specified window. The font is specified by its X11 font name string (e.g., "fixed", "9x15", "-misc-fixed-*-*-*-*-*-*-*-*-*-*-*-*"). Only fixed-width bitmap fonts are supported by the underlying Xlib. Consult the xfontsel utility for available font names. Calling this function loads the font into the X server; if the font cannot be loaded, the previous font (if any) remains unchanged and the behavior is implementation-defined. The font is per-window; each window maintains its own font.

**Signature:** `void mlx_set_font(void *mlx_ptr, void *win_ptr, char *name)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `win_ptr` (void *): The window identifier for which the font should be set. The font applies only to this window.
- `name` (char *): A null-terminated string containing the X11 logical font name. Must not be NULL.

**Returns:** This function returns void. No error indication is provided; failure to load the font is silently ignored.

**Example:**
```c

#include <mlx.h>

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 400, 300, "Font Example");
    mlx_set_font(mlx, win, "9x15");
    mlx_string_put(mlx, win, 20, 100, 0x00FFFFFF, "This uses the 9x15 font.");
    mlx_loop(mlx);
    return 0;
}

```

## mlx_get_color_value

Translates an RGB color value (0x00RRGGBB) into a display-specific pixel value suitable for storing in an image buffer obtained via mlx_get_data_addr(). On displays with depth >= 24 (true color), the function returns the color value unchanged (no conversion needed). On lower-depth displays (e.g., 8-bit PseudoColor), it performs a best-match conversion using the X server's colormap. The returned value must be stored in the image buffer using the appropriate number of bits as indicated by bits_per_pixel, respecting the endianness of the image.

**Signature:** `int mlx_get_color_value(void *mlx_ptr, int color)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `color` (int): An RGB color value in 0x00RRGGBB format. Only the lower 24 bits are considered; the high byte is ignored.

**Returns:** Returns an unsigned int that can be written directly into an image buffer. On true-color displays, this is the original color value; on indexed displays, it is the best-match pixel value.

**Example:**
```c

#include <mlx.h>

int main()
{
    void *mlx = mlx_init();
    // Get the pixel value for pure red
    int pixel_val = mlx_get_color_value(mlx, 0x00FF0000);
    // Now pixel_val can be written into an image data buffer
    void *img = mlx_new_image(mlx, 100, 100);
    int bpp, size_line, endian;
    char *data = mlx_get_data_addr(img, &bpp, &size_line, &endian);
    // Assign the first pixel with the translated color
    *(unsigned int *)data = pixel_val;
    return 0;
}

```

## mlx_clear_window

Clears the entire content of the specified window by filling it with black (color 0x00000000). This operation is immediate and replaces all previous drawing. It does not reset the window's exposure state; after clearing, an expose event may still be generated. The function corresponds to XClearWindow in Xlib.

**Signature:** `int mlx_clear_window(void *mlx_ptr, void *win_ptr)`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `win_ptr` (void *): The window identifier returned by mlx_new_window() to be cleared.

**Returns:** Returns 0 on success. On error, the return value is implementation-defined (some versions may return -1).

**Example:**
```c

#include <mlx.h>

int main()
{
    void *mlx = mlx_init();
    void *win = mlx_new_window(mlx, 800, 600, "Clear Example");
    mlx_pixel_put(mlx, win, 100, 100, 0x00FF0000);
    // Clear the window (the pixel will disappear)
    mlx_clear_window(mlx, win);
    mlx_loop(mlx);
    return 0;
}

```

## Notes

- All coordinates (x, y) are zero-based with origin at the top-left corner. Positive x increases to the right, positive y increases downward. Attempting to draw outside the window boundaries has no effect in standard implementations.
- The pixel and string drawing functions use immediate mode: each call generates an X protocol request. For frequent drawing (e.g., on every frame), performance may degrade. Use image buffers (mlx_new_image) and blit to the window for better performance.
- Color is always specified as 0x00RRGGBB, where the most significant byte is ignored. On systems where int is 32-bit, the color value is packed as described. Endianness: the blue component always occupies the least significant byte in the integer.
- Font names for mlx_set_font must be X11 logical font descriptions (XLFD). Only bitmap fonts are supported. The xfontsel tool can be used to browse available fonts. If the font name is invalid, the function fails silently and the previous font remains active.
- Error handling: None of the drawing functions provide robust error checking. Invalid parameters (e.g., NULL pointers) may cause segmentation faults. Always ensure windows exist and mlx_ptr is valid before calling drawing functions.
- Thread safety: The MiniLibX drawing module is **not thread-safe**. All drawing operations should be performed from the main thread that called mlx_init. Concurrent access from multiple threads leads to race conditions and unpredictable behavior.
- Platform-specific behavior: On macOS (using the Cocoa backend), some functions may behave differently; for instance, mlx_get_color_value may always return the input value, and mlx_clear_window might have no effect. For portability, avoid relying on implementation details beyond what is documented.
- Font lifetime: The font loaded by mlx_set_font is unloaded when the window is destroyed or when a new font is set. There is no need to manually free font resources.