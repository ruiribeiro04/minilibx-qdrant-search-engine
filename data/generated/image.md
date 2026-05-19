# MiniLibX Image Module Documentation

The MiniLibX image module provides functions for creating, manipulating, and rendering off-screen pixel buffers (images). It allows you to work with pixel data directly in memory before drawing it to a window, which is far more efficient than drawing individual pixels with `mlx_pixel_put`. The module includes: creating a blank image (`mlx_new_image`), obtaining a pointer to its pixel buffer (`mlx_get_data_addr`), drawing the image into a window (`mlx_put_image_to_window`), loading images from XPM files or data (`mlx_xpm_file_to_image`, `mlx_xpm_to_image`), querying color conversion values (`mlx_get_color_value`), and destroying images (`mlx_destroy_image`).

Internally, images are stored as a contiguous block of memory. Each pixel is represented by a number of bits (`bits_per_pixel`), and lines are packed with a fixed stride (`size_line`). The endianness of the pixel data is given by the `endian` parameter: 0 for little-endian, 1 for big-endian. When modifying pixel data, you must respect these parameters and convert RGB triples using `mlx_get_color_value` to ensure correct colors across different display servers.

**Thread safety:** The library is *not* thread-safe. All calls should be made from the same thread that initialised the connection. Concurrent access to the same image from multiple threads leads to undefined behaviour.

**Platform-specific behaviour:** The image module uses the X Shm extension if available, automatically choosing shared memory images for better performance. On systems without XShm, it falls back to standard XImages. This is transparent to the user. XPM loading uses an internal parser, not the standard libXpm library; some complex XPM files may not load correctly.

## mlx_new_image

Creates a new image in memory with the given width and height. The pixel buffer is zero-initialized (all pixels black/transparent depending on depth). Returns a pointer to the image handle, or NULL on failure (e.g., out of memory).

**Signature:** `void *mlx_new_image(void *mlx_ptr, int width, int height);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier returned by mlx_init().
- `width` (int): Desired image width in pixels.
- `height` (int): Desired image height in pixels.

**Returns:** void * – Handle to the new image, or NULL on error.

**Example:**
```c
void *mlx = mlx_init();
void *img = mlx_new_image(mlx, 640, 480);
if (!img) { /* handle error */ }
```

## mlx_get_data_addr

Returns a pointer to the pixel data buffer of the image, and fills the provided integers with the image's properties. `bits_per_pixel` receives the number of bits used to store one pixel (commonly 32). `size_line` is the number of bytes between the start of one row and the next (may include padding). `endian` receives 0 for little-endian order or 1 for big-endian order (indicating the byte order used by the X server). The returned pointer can be used to read and write pixel data directly.

**Signature:** `char *mlx_get_data_addr(void *img_ptr, int *bits_per_pixel, int *size_line, int *endian);`

**Parameters:**
- `img_ptr` (void *): The image handle obtained from mlx_new_image or mlx_xpm_* functions.
- `bits_per_pixel` (int *): Output: number of bits per pixel.
- `size_line` (int *): Output: bytes per row (stride).
- `endian` (int *): Output: 0 = little endian, 1 = big endian.

**Returns:** char * – Pointer to the first byte of the pixel buffer.

**Example:**
```c
int bpp, size_line, endian;
char *buf = mlx_get_data_addr(img, &bpp, &size_line, &endian);
// Set pixel at (x,y) to red (assuming 32-bit, little-endian)
int offset = y * size_line + x * (bpp / 8);
*(unsigned int *)(buf + offset) = 0x00FF0000;
```

## mlx_put_image_to_window

Draws the entire image onto the specified window at coordinates (x, y). The top-left corner of the image is placed at (x, y) in the window. Pixels outside the window are clipped. Returns 0 on success (the return value is not well documented; always succeeds if parameters are valid).

**Signature:** `int mlx_put_image_to_window(void *mlx_ptr, void *win_ptr, void *img_ptr, int x, int y);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `win_ptr` (void *): The window handle where the image will be drawn.
- `img_ptr` (void *): The image handle to draw.
- `x` (int): X-coordinate of the top-left corner in the window.
- `y` (int): Y-coordinate (positive downward) of the top-left corner.

**Returns:** int – 0 on success (in practice, no error is returned).

**Example:**
```c
mlx_put_image_to_window(mlx, win, img, 100, 50);
```

## mlx_get_color_value

Converts an RGB color (encoded as 0x00RRGGBB) into a value suitable for storing in an image pixel buffer, considering the display's depth and visual. The returned value fits in `bits_per_pixel` bits (the least significant bits). This conversion is necessary to ensure the color is correctly interpreted by the X server. The endianness of the returned value matches the display's endianness.

**Signature:** `int mlx_get_color_value(void *mlx_ptr, int color);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `color` (int): RGB color coded as 0x00RRGGBB.

**Returns:** int – Color value ready to be stored in pixel data (use the least significant `bits_per_pixel` bits).

**Example:**
```c
int pixel_color = mlx_get_color_value(mlx, 0x00FF8800);
*(int *)(buf + offset) = pixel_color;
```

## mlx_xpm_to_image

Creates a new image from XPM data provided as an array of strings (xpm_data). The array must be a valid XPM format (version 3). On success, returns a pointer to the new image and sets `width` and `height` to the image dimensions. Returns NULL on error (invalid format, unsupported features, memory failure). Transparency is handled (a special color index is treated as transparent).

**Signature:** `void *mlx_xpm_to_image(void *mlx_ptr, char **xpm_data, int *width, int *height);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `xpm_data` (char **): Pointer to XPM data array (null-terminated strings).
- `width` (int *): Output: image width in pixels.
- `height` (int *): Output: image height in pixels.

**Returns:** void * – New image handle, or NULL on failure.

**Example:**
```c
int w, h;
char *xpm[] = {"/* XPM */", ... , NULL};
void *img = mlx_xpm_to_image(mlx, xpm, &w, &h);
```

## mlx_xpm_file_to_image

Same as `mlx_xpm_to_image`, but reads the XPM data from a file named `filename`. The file must be a valid XPM image. Returns a new image handle, or NULL if the file cannot be opened or parsed.

**Signature:** `void *mlx_xpm_file_to_image(void *mlx_ptr, char *filename, int *width, int *height);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `filename` (char *): Path to an XPM file.
- `width` (int *): Output: image width.
- `height` (int *): Output: image height.

**Returns:** void * – New image handle, or NULL on failure.

**Example:**
```c
int w, h;
void *img = mlx_xpm_file_to_image(mlx, "./texture.xpm", &w, &h);
```

## mlx_destroy_image

Frees all resources associated with the image: the pixel data, the X image and pixmap, and the image structure itself. If the image used shared memory, the shared memory segment is detached. After calling this, the image pointer becomes invalid.

**Signature:** `int mlx_destroy_image(void *mlx_ptr, void *img_ptr);`

**Parameters:**
- `mlx_ptr` (void *): The connection identifier.
- `img_ptr` (void *): The image handle to destroy.

**Returns:** int – 0 on success.

**Example:**
```c
mlx_destroy_image(mlx, img);
img = NULL;
```

## Notes

- **Performance:** Always prefer off-screen images and `mlx_put_image_to_window` over `mlx_pixel_put` for continuous drawing. `mlx_pixel_put` sends a separate X request per pixel, which is extremely slow for large areas.
- **Pixel buffer layout:** The pixel data is aligned on 32-bit boundaries (row padding exists). Use `size_line` to advance to the next row. Writing beyond the allocated buffer causes undefined behaviour.
- **Color conversion:** For depths other than 24/32-bit true color, `mlx_get_color_value` is essential. For a 32-bit TrueColor visual, the conversion often does nothing, but relying on this is not portable.
- **Endianness:** The `endian` returned by `mlx_get_data_addr` indicates the byte order of the X server. If your local machine has a different endianness, you must swap bytes of pixel values obtained from `mlx_get_color_value` before storing them, or swap when reading.
- **Memory management:** Every image created must be destroyed with `mlx_destroy_image` to avoid memory leaks. The library does not track images automatically.
- **XPM limitations:** The internal XPM parser may not support all features of the XPM format (e.g., colour symbols, extensions). Test your XPM files. Transparency works by using a specific colour (usually the one defined as 'None' in the XPM file).