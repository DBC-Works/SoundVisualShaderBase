SoundVisualShaderBase
======

SoundVisualShaderBase is a [GLSL fragment shader](https://www.khronos.org/opengl/wiki/Fragment_Shader) host program made by [Processing 3.5 or later](https://processing.org/).

Requirements
------

SoundVisualShaderBase needs Processing 3.5 or later to run.

### libraries

SoundVisualShaderBase is also using following libaries:

- [Minim](http://code.compartmental.net/minim/)
- [Spout for Processing](https://github.com/leadedge/SpoutProcessing/wiki)

Install thiese [libraries](https://processing.org/reference/libraries/) using PDE.

Usage
-----

1. Open project directory.
2. Create or edit fragment shader file(s) if you want.
1. Edit `setting.json` in `data` directory to define playback audio files and fragment shader usage informations.
    * Refer to `setting-schema.json` for schema definition.
    * Refer to file header comment of fragment shader file for kind and options(bundled files only).
3. Edit the beginning of the `setup` function in `SoundVisualShaderBase.pde` to define the dimension of the display window.
4. Run.
5. Operate if you want.

Operation
------

### Key

- `1`-`0` - Toggle use of specified index (in `setting.json`) shader(`0` as 10)
- `PrtSc` - Save image

### Mouse

Some fragment shaders reflect the mouse position in the drawing.

License
------

MIT