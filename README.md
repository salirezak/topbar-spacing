# Topbar Spacing

A GNOME Shell extension that adjusts the spacing between items in the top bar's left, center, and right sections.

[GNOME Shell 50](https://github.com/salirezak/topbar-spacing) ([badge](https://img.shields.io/badge/GNOME%20Shell-50-4a86cf)) [License: GPL v3](https://github.com/salirezak/topbar-spacing/blob/master/LICENSE) ([badge](https://img.shields.io/badge/License-GPLv3-blue.svg))

## Features

- Set the spacing between items independently for the left, center, and right panel sections.
- Enable or disable spacing adjustments for each section. Disabled sections use the system default.
- Adjust spacing from 0 to 32 pixels in the preferences window.
- Apply spacing to panel items added while the extension is running.
- Restore all settings to their defaults with one button.

## Requirements

- GNOME Shell 50

## Installation

The extension is not yet listed on [GNOME Extensions](https://extensions.gnome.org/). To install from this source repository:

```sh
git clone https://github.com/salirezak/topbar-spacing.git
cd topbar-spacing
mkdir -p ~/.local/share/gnome-shell/extensions/topbar-spacing@salirezak.github.io
cp extension.js prefs.js metadata.json \
  ~/.local/share/gnome-shell/extensions/topbar-spacing@salirezak.github.io/
mkdir -p ~/.local/share/gnome-shell/extensions/topbar-spacing@salirezak.github.io/schemas
cp schemas/org.gnome.shell.extensions.topbar-spacing.gschema.xml \
  ~/.local/share/gnome-shell/extensions/topbar-spacing@salirezak.github.io/schemas/
glib-compile-schemas ~/.local/share/gnome-shell/extensions/topbar-spacing@salirezak.github.io/schemas
gnome-extensions enable topbar-spacing@salirezak.github.io
```

On Wayland, log out and back in if the extension does not appear after installation. You can also enable it with the **Extensions** app.

### Testing during development

To test the extension in a separate GNOME Shell Wayland session, install `mutter-devkit` if it is not already installed. Then run:

```sh
dbus-run-session gnome-shell --devkit --wayland
```

The extension must already be installed in the standard GNOME Shell extensions directory. You may need to enable it separately.

[More information about testing GNOME Shell extensions](https://gjs.guide/extensions/development/creating.html#testing-the-extension).

## Configuration

Open the extension's preferences from the **Extensions** app or run:

```sh
gnome-extensions prefs topbar-spacing@salirezak.github.io
```

For each panel section, preferences provide a switch to enable spacing adjustments and a slider to set the value from 0 to 32 pixels. **Reset** restores all six settings to their defaults (spacing of 1 pixel, enabled for all sections).

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/salirezak/topbar-spacing). Please include your GNOME Shell version and relevant logs when reporting a problem.

## Acknowledgments

This project was inspired by and builds on ideas from [Status Area Horizontal Spacing for GNOME Shell](https://gitlab.com/p91paul/status-area-horizontal-spacing-gnome-shell).

## License

This project is licensed under the [GNU General Public License v3.0](https://github.com/salirezak/topbar-spacing/blob/master/LICENSE).
