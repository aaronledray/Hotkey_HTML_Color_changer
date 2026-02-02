# HTML Painter Hotkey

Cycle through **text color** or **highlight color** on selected text using keyboard shortcuts in Obsidian.

## Features

- **Cycle text colors**: Apply colors like black → red → blue → green → clear
- **Cycle highlight colors**: Apply background colors like yellow → cyan → salmon → clear
- Supports any valid CSS color name or hex code
- Customizable color lists in plugin settings
- Selection stays highlighted so you can keep pressing the hotkey to cycle

## Usage

1. Select any text in your Obsidian note
2. Press your assigned hotkey to apply the first color
3. Press again to cycle to the next color
4. After the final color, the styling is removed (text returns to normal)

## Settings

Define your own color sequences in Settings → HTML Painter Hotkey:

- **Text Colors**: e.g., `black, red, #0044ff, null`
- **Highlight Colors**: e.g., `yellow, cyan, #fa8072, #ccff00, null`

Use `null` as the last item to add a "clear styling" step at the end of the cycle.

## Hotkeys

Go to **Settings → Hotkeys** and search for "HTML Painter" to assign keys to:

- `Cycle HTML Text Color on Selection`
- `Cycle HTML Highlight (Background Color) on Selection`

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community plugins
2. Click "Browse" and search for "HTML Painter Hotkey"
3. Click Install, then Enable

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder called `html-painter-hotkey` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into that folder
4. Enable the plugin in Settings → Community plugins

## License

MIT
