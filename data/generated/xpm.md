# MiniLibX XPM Image Module

The XPM module of MiniLibX provides functions to load X PixMap (XPM) images from files or from in-memory string arrays. XPM is a common image file format used for icons and small graphics in X11 environments. The module converts XPM data into MiniLibX image objects that can then be drawn to windows or manipulated pixel by pixel. The core functions are `mlx_xpm_to_image` (load from an array of strings) and `mlx_xpm_file_to_image` (load from a file). Both parse the XPM format, handle color tables (direct color or palette-based), support transparency (represented as `0xFF000000` in the pixel data), and return a new image identifier along with the image dimensions through pointer output parameters. The module relies on the library's internal image infrastructure (`mlx_new_image`, `mlx_get_data_addr`) and the X11 display connection. Note that the implementation is not a full XPM standard library; some advanced XPM features may not be supported (as noted in the source comments). Thread safety depends on the underlying X11 connection: MiniLibX is not designed for multi-threaded access.

## mlx_xpm_file_to_image

Loads an XPM image from a file on disk into a new MiniLibX image object. The file is opened, memory-mapped, and parsed for XPM data (comments are stripped). The resulting image is created internally and its dimensions are written to the integer pointed by `width` and `height`. The function returns an opaque pointer to the new image, or `NULL` on failure.

**Signature:** `void  *mlx_xpm_file_to_image (void *mlx_ptr, char *filename, int *width, int *height);`

**Parameters:**
- `mlx_ptr` (void *): 
- `filename` (char *): 
- `width` (int *): 
- `height` (int *): 

**Returns:** Returns a non-null `void *` image identifier on success. Returns `NULL` if the file cannot be opened, read, or parsed, or if memory allocation fails. The caller must eventually call `mlx_destroy_image()` to free the image.

**Example:**
```c
```c
int width, height;
void *img = mlx_xpm_file_to_image(mlx_ptr, "icon.xpm", &width, &height);
if (!img) {
    fprintf(stderr, "Failed to load icon.xpm\n");
    exit(1);
}
mlx_put_image_to_window(mlx_ptr, win_ptr, img, 100, 50);
```
```

## mlx_xpm_to_image

Creates a new MiniLibX image from an in-memory XPM data array. The `xpm_data` array should contain the XPM image as an array of strings, exactly as defined by the XPM format (including the `/* XPM */` header line, dimensions/color line, palette entries, and pixel rows). The function parses this data, builds a color table (direct or palette-based), and writes pixel data into the image. The image dimensions are returned through `width` and `height`. Transparency is handled: pixels with an unrecognized or "None" color become `0xFF000000`. Returns an image identifier or `NULL` on error.

**Signature:** `void  *mlx_xpm_to_image (void *mlx_ptr, char **xpm_data, int *width, int *height);`

**Parameters:**
- `mlx_ptr` (void *): 
- `xpm_data` (char **): 
- `width` (int *): 
- `height` (int *): 

**Returns:** Returns a non-null `void *` image identifier on success. Returns `NULL` if parsing fails or memory cannot be allocated. The image must be freed with `mlx_destroy_image()`.

**Example:**
```c
```c
char *xpm_data[] = {
    "/* XPM */",
    "static char *test_xpm[] = {",
    "10 10 2 1",
    "    c #FFFFFF",
    ".   c #000000",
    "..........",
    "..........",
    "..........",
    "..........",
    "..........",
    "..........",
    "..........",
    "..........",
    "..........",
    ".........."
};
int w, h;
void *img = mlx_xpm_to_image(mlx_ptr, xpm_data, &w, &h);
if (img) {
    mlx_put_image_to_window(mlx_ptr, win_ptr, img, 0, 0);
}
```
```

## Notes

- Do not forget to call `mlx_destroy_image()` on any image created by `mlx_xpm_to_image` or `mlx_xpm_file_to_image` when it is no longer needed, to avoid memory leaks.
- The returned image can be used with `mlx_put_image_to_window()` for drawing, and its pixel data can be accessed via `mlx_get_data_addr()` if modifications are required.
- Transparency support: Pixels that are transparent in the XPM (i.e., the color name `"None"` or an undefined color) are stored as `0xFF000000` in the image data. This allows blending if the rendering context supports it, but note that MiniLibX does not perform alpha blending itself; the alpha byte is simply stored.
- The internal implementation uses two alternate code paths (see source file `mlx_int_parse_xpm`): one for XPM images with color depth ≤ 2 (direct color via `colors_direct` array) and one with a palette (up to `nc` entries). Both handle transparency and have been tested with common XPM files, but very exotic XPM variants may not load correctly.
- The `mlx_xpm_file_to_image` function uses `mmap` for efficient file reading. On platforms where `mmap` is not available or fails, the function will return NULL.
- Neither function is thread-safe. MiniLibX as a whole assumes single-threaded access to the X11 display connection.